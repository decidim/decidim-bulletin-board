# frozen_string_literal: true

require_relative "../support/electionguard_test_data"

FactoryBot.define do
  ELECTION_STEPS = ElectionguardTestData.election_steps
  ELECTION_TITLE = ElectionguardTestData.election_title
  ELECTION_TRUSTEES_IDS = ElectionguardTestData.trustee_ids
  CREATE_ELECTION_MESSAGE = ElectionguardTestData.create_election_message

  TRUSTEE_ELECTION_KEYS_MESSAGES = ElectionguardTestData.trustee_election_keys

  TRUSTEE_PARTIAL_ELECTION_KEYS_MESSAGES = ElectionguardTestData.trustee_partial_election_keys

  TRUSTEE_VERIFICATION_MESSAGES = ElectionguardTestData.trustee_verifications

  END_KEY_CEREMONY_MESSAGE = ElectionguardTestData.end_key_ceremony

  factory :electionguard_election, class: "Election" do
    transient do
      authority_private_key { generate(:private_key) }
      trustees_plus_keys { generate_list(:private_key, 3).zip(ELECTION_TRUSTEES_IDS).map { |private_key, id| [build(:trustee, unique_id: id, private_key: private_key), private_key] } }
      last_step { :end_key_ceremony }
      voting_scheme { :electionguard }
    end

    title { ELECTION_TITLE }
    authority { build(:authority, private_key: authority_private_key) }
    status { "key_ceremony" }
    unique_id { [authority.unique_id, generate(:election_id)].join(".") }

    after(:build) do |election, evaluator|
      election.trustees << evaluator.trustees_plus_keys.map(&:first)

      raise "Wrong last step: #{evaluator.last_step}" unless ELECTION_STEPS.include?(evaluator.last_step)

      ELECTION_STEPS.each do |step|
        type, subtype = step.to_s.split(".")
        subtype = type if subtype.nil?
        send("#{subtype}_step", election, evaluator)
        break if evaluator.last_step == step
      end
    end
  end
end

def create_election_step(election, evaluator)
  create_election_message = CREATE_ELECTION_MESSAGE.deep_dup
  create_election_message["iat"] = Time.current.to_i
  create_election_message["message_id"] = "#{election.unique_id}.create_election+a.#{election.authority.slug}"

  evaluator.trustees_plus_keys.map(&:first).each_with_index do |trustee, order|
    create_election_message["trustees"][order]["public_key"] = trustee.public_key
  end

  election.log_entries << FactoryBot.build(:log_entry, election: election, client: election.authority,
                                                       private_key: evaluator.authority_private_key, message: create_election_message)
end

def start_key_ceremony_step(election, evaluator)
  start_key_ceremony_message = {}
  start_key_ceremony_message["iat"] = Time.current.to_i
  start_key_ceremony_message["message_id"] = "#{election.unique_id}.start_key_ceremony+a.#{election.authority.slug}"

  election.log_entries << FactoryBot.build(:log_entry, election: election, client: election.authority,
                                                       private_key: evaluator.authority_private_key, message: start_key_ceremony_message)
end

def trustee_election_keys_step(election, evaluator)
  TRUSTEE_ELECTION_KEYS_MESSAGES.each_with_index do |message, order|
    trustee, private_key = evaluator.trustees_plus_keys[order]
    content = JSON.parse(message["content"])

    raise "Mismatched trustee #{trustee.slug} vs msg #{content["guardian_record"]["guardian_id"]}" if trustee.slug != content["guardian_record"]["guardian_id"]

    trustee_public_key_message = message.deep_dup
    trustee_public_key_message["iat"] = Time.current.to_i
    trustee_public_key_message["message_id"] = "#{election.unique_id}.key_ceremony.trustee_election_keys+t.#{trustee.slug}"

    election.log_entries << FactoryBot.build(:log_entry, election: election, client: trustee,
                                                         private_key: private_key, message: trustee_public_key_message)
  end
end

def trustee_partial_election_keys_step(election, evaluator)
  TRUSTEE_PARTIAL_ELECTION_KEYS_MESSAGES.each_with_index do |message, order|
    trustee, private_key = evaluator.trustees_plus_keys[order]

    raise "Mismatched trustee #{trustee.slug} vs msg #{JSON.parse(message["content"])["guardian_id"]}" if trustee.slug != JSON.parse(message["content"])["guardian_id"]

    trustee_partial_public_key_message = message.deep_dup
    trustee_partial_public_key_message["iat"] = Time.current.to_i
    trustee_partial_public_key_message["message_id"] = "#{election.unique_id}.key_ceremony.trustee_partial_election_keys+t.#{trustee.slug}"

    election.log_entries << FactoryBot.build(:log_entry, election: election, client: trustee,
                                                         private_key: private_key, message: trustee_partial_public_key_message)
  end
end

def trustee_verification_step(election, evaluator)
  TRUSTEE_VERIFICATION_MESSAGES.each_with_index do |message, order|
    trustee, private_key = evaluator.trustees_plus_keys[order]

    raise "Mismatched trustee #{trustee.slug} vs msg #{JSON.parse(message["content"])["guardian_id"]}" if trustee.slug != JSON.parse(message["content"])["guardian_id"]

    trustee_verification_message = message.deep_dup
    trustee_verification_message["iat"] = Time.current.to_i
    trustee_verification_message["message_id"] = "#{election.unique_id}.key_ceremony.trustee_verification+t.#{trustee.slug}"

    election.log_entries << FactoryBot.build(:log_entry, election: election, client: trustee,
                                                         private_key: private_key, message: trustee_verification_message)
  end
end

def end_key_ceremony_step(election, _evaluator)
  end_key_ceremony_message = END_KEY_CEREMONY_MESSAGE.deep_dup
  end_key_ceremony_message["iat"] = Time.current.to_i
  end_key_ceremony_message["message_id"] = "#{election.unique_id}.end_key_ceremony+b.#{BulletinBoard.slug}"

  election.log_entries << FactoryBot.build(:log_entry, election: election, bulletin_board: true,
                                                       signed_data: BulletinBoard.sign(end_key_ceremony_message), message: end_key_ceremony_message)
end
