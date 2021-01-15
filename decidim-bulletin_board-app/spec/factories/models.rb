# frozen_string_literal: true

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
    public_key_thumbprint { Decidim::BulletinBoard::JwkUtils.thumbprint(private_key.export) }
    unique_id { name.parameterize }

    factory :authority, class: "Authority" do
      api_key { Faker::Crypto.sha256 }
    end
    factory :trustee, class: "Trustee"
  end

  factory :election do
    transient do
      authority_private_key { DevPrivateKeys.authority_private_key }
      trustees_plus_keys { Trustee.first(3).zip(DevPrivateKeys.trustees_private_keys) }
      election_id { generate(:election_id) }
    end

    title { Faker::Name.name }
    authority { Authority.first }
    status { "key_ceremony" }
    unique_id { [authority.unique_id, election_id].join(".") }
    voting_scheme_state { Marshal.dump(joint_election_key: 1, trustees: []) }

    after(:build) do |election, evaluator|
      election.trustees << evaluator.trustees_plus_keys.map(&:first)
      election.log_entries << build(:log_entry, election: election, private_key: evaluator.authority_private_key,
                                                message: build(:create_election_message, election_id: election.unique_id,
                                                                                         authority: election.authority,
                                                                                         voting_scheme: :dummy,
                                                                                         trustees_plus_keys: evaluator.trustees_plus_keys))
    end
  end

  trait :message_model do
    transient do
      private_key { DevPrivateKeys.authority_private_key }
      message { {} }
    end

    election { build(:election) }
    client { election.authority }
    message_id { message["message_id"] }
    signed_data { JWT.encode(message, private_key.keypair, "RS256") }
  end

  factory :log_entry, traits: [:message_model] do
    content_hash { Digest::SHA256.hexdigest(message["content"]) if message["content"] }
  end

  factory :pending_message, traits: [:message_model] do
    status { :enqueued }

    trait :accepted do
      status { :accepted }
    end

    trait :rejected do
      status { :rejected }
    end
  end
end
