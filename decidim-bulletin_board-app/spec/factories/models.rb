# frozen_string_literal: true

require "test/elections"

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
    unique_id { name.parameterize }

    factory :authority, class: "Authority" do
      api_key { Faker::Crypto.sha256 }
    end
    factory :trustee, class: "Trustee"
  end

  factory :election do
    transient do
      authority_private_key { Test::PrivateKeys.authority_private_key }
      trustees_plus_keys { Trustee.first(3).zip(Test::PrivateKeys.trustees_private_keys) }
      election_id { generate(:election_id) }
    end

    title { { en: Faker::Name.name } }
    authority { Authority.first }
    status { :created }
    unique_id { [authority.unique_id, election_id].join(".") }
    voting_scheme_state { nil }

    after(:build) do |election, evaluator|
      election.trustees << evaluator.trustees_plus_keys.map(&:first)
      election.log_entries << build(:log_entry, election: election, private_key: evaluator.authority_private_key,
                                                message: build(:create_election_message, election_id: election.unique_id,
                                                                                         authority_client: election.authority,
                                                                                         voting_scheme: :dummy,
                                                                                         trustees_plus_keys: evaluator.trustees_plus_keys))
    end

    trait :key_ceremony do
      transient do
        trustees_done { [] }
      end

      status { :key_ceremony }
      voting_scheme_state { Marshal.dump(joint_election_key: 1, trustees: trustees_done.map(&:unique_id)) }
    end

    trait :key_ceremony_ended do
      status { :key_ceremony_ended }
      voting_scheme_state { Marshal.dump(joint_election_key: 1, trustees: trustees_plus_keys.map(&:first).map(&:unique_id)) }
    end

    trait :vote do
      key_ceremony_ended
      status { :vote }
    end

    trait :vote_ended do
      vote
      status { :vote_ended }
    end

    trait :tally do
      transient do
        trustees_done { [] }
      end

      vote_ended
      status { :tally }

      after(:build) do |election, evaluator|
        joint_shares = Test::Elections.build_cast(election) { 1 }
        election.voting_scheme_state = Marshal.dump(joint_election_key: Test::Elections.joint_election_key,
                                                    trustees: evaluator.trustees_plus_keys.map(&:first).map(&:unique_id),
                                                    joint_shares: joint_shares,
                                                    shares: evaluator.trustees_done.map(&:unique_id))
      end
    end

    trait :tally_ended do
      status { :tally_ended }

      after(:build) do |election, evaluator|
        joint_shares = Test::Elections.build_cast(election) { Random.random_number(99) + Random.random_number(13) * Test::Elections.joint_election_key }
        election.voting_scheme_state = Marshal.dump(joint_election_key: Test::Elections.joint_election_key,
                                                    trustees: evaluator.trustees_plus_keys.map(&:first).map(&:unique_id),
                                                    joint_shares: joint_shares,
                                                    shares: evaluator.trustees_plus_keys.map(&:first).map(&:unique_id))
      end
    end

    trait :results_published do
      tally_ended
      status { :results_published }
    end
  end

  trait :message_model do
    transient do
      private_key { Test::PrivateKeys.authority_private_key }
      message { {} }
    end

    election { build(:election) }
    client { election.authority }
    message_id { message["message_id"] }
    signed_data { JWT.encode(message, private_key.keypair, "RS256") }
  end

  factory :log_entry, traits: [:message_model] do
    content_hash { Digest::SHA256.hexdigest(message["content"]) if message["content"] }

    trait :by_trustee do
      client { Trustee.first }
      private_key { Test::PrivateKeys.trustees_private_keys.first }
    end

    trait :by_bulletin_board do
      bulletin_board { true }
      client { nil }
      signed_data { BulletinBoard.sign(message) }
    end
  end

  factory :pending_message, traits: [:message_model] do
    status { :enqueued }

    trait :accepted do
      status { :accepted }
    end

    trait :rejected do
      status { :rejected }
    end

    trait :by_trustee do
      client { Trustee.first }
      private_key { Test::PrivateKeys.trustees_private_keys.first }
    end
  end
end
