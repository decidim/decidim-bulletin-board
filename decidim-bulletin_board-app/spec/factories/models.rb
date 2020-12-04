# frozen_string_literal: true

require "jwk_utils"

FactoryBot.define do
  sequence(:election_id) do |n|
    n
  end

  sequence(:private_key) do
    JWT::JWK.new(OpenSSL::PKey::RSA.new(4096))
  end

  factory :client do
    transient do
      private_key { generate(:private_key) }
    end

    name { Faker::Name.unique.name }
    public_key { private_key.export }
    public_key_thumbprint { JwkUtils.thumbprint(private_key.export) }
    unique_id { name.parameterize }

    factory :authority, class: "Authority" do
      api_key { Faker::Crypto.sha256 }
    end
    factory :trustee, class: "Trustee"
  end

  factory :election do
    transient do
      authority_private_key { generate(:private_key) }
      trustees_plus_keys { build_list(:trustee, 3).zip(generate_list(:private_key, 3)) }
    end

    title { Faker::Name.name }
    authority { build(:authority, private_key: authority_private_key) }
    status { "key_ceremony" }
    unique_id { [authority.unique_id, generate(:election_id)].join(".") }
    voting_scheme_state { Marshal.dump(joint_election_key: 1, trustees: []) }

    after(:build) do |election, evaluator|
      election.trustees << evaluator.trustees_plus_keys.map(&:first)
      election.log_entries << build(:log_entry, election: election, client: election.authority, private_key: evaluator.authority_private_key,
                                                message: build(:create_election_message, voting_scheme: :dummy,
                                                                                         trustees_plus_keys: evaluator.trustees_plus_keys))
    end
  end

  factory :log_entry do
    transient do
      authority { build(:authority, private_key: private_key) }
      private_key { generate(:private_key) }
      message { {} }
    end

    election { build(:election, authority: authority, authority_private_key: private_key) }
    client { authority }
    message_id { message["message_id"] }
    signed_data { JWT.encode(message, private_key.keypair, "RS256") }
  end

  factory :pending_message, parent: :log_entry, class: :pending_message do
    status { :enqueued }
    election { nil }

    trait :accepted do
      status { :accepted }
      election
    end

    trait :rejected do
      status { :rejected }
    end
  end
end
