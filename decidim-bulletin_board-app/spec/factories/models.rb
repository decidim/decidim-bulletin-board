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
    unique_id { [authority.name.parameterize, generate(:election_id)].join(".") }

    after(:build) do |election, evaluator|
      evaluator.trustees_plus_keys.each do |trustee, _key|
        election.trustees << trustee
      end
      election.log_entries << build(:create_election_entry, election: election, private_key: evaluator.authority_private_key,
                                                            client: election.authority, trustees_plus_keys: evaluator.trustees_plus_keys)
    end
  end

  factory :election_trustee do
    election
    trustee
  end

  factory :create_election_entry, class: "LogEntry" do
    transient do
      trustees_plus_keys { build_list(:trustee, 3).zip(generate_list(:private_key, 3)) }
      private_key { generate(:private_key) }
      message { build(:create_election_message, trustees_plus_keys: trustees_plus_keys) }
    end

    election
    client { build(:authority, private_key: private_key) }
    signed_data { JWT.encode(message, private_key.keypair, "RS256") }
    chained_hash { Digest::SHA256.hexdigest(election.unique_id) }
    message_id { message["message_id"] }
  end
end
