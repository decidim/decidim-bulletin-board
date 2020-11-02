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
    title { Faker::Name.name }
    authority
    status { "key_ceremony" }
    unique_id { [authority.name.parameterize, generate(:election_id)].join(".") }

    after(:build) do |election|
      3.times do
        election.election_trustees << build(:election_trustee, election: election)
      end
    end
  end

  factory :election_trustee do
    election
    trustee
  end
end
