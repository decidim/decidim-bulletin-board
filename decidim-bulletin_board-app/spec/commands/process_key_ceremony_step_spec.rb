# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe ProcessKeyCeremonyStep do
  subject { described_class.call(trustee, message_id, signed_data) }

  include_context "with a signed message"

  let!(:election) do
    create(:election, status: election_status,
                      trustees_plus_keys: trustees_plus_keys,
                      voting_scheme_state: voting_scheme_state)
  end
  let(:election_status) { :key_ceremony }
  let(:trustees_plus_keys) { generate_list(:private_key, 3).map { |key| [create(:trustee, private_key: key), key] } }
  let(:voting_scheme_state) { Marshal.dump(joint_election_key: 1, trustees: public_keys_already_sent.map(&:unique_id)) }
  let(:public_keys_already_sent) { [] }
  let(:trustee) { trustees_plus_keys.first.first }
  let(:private_key) { trustees_plus_keys.first.last }
  let(:message_type) { :key_ceremony_message }
  let(:message_params) { { election: election, trustee: trustee } }

  it "broadcast ok" do
    expect { subject }.to broadcast(:ok)
  end

  it "creates the log entry for the message" do
    expect { subject }.to change(LogEntry, :count).by(1)
  end

  it "persists the new state for the voting scheme" do
    expect { subject }.to(change { Election.last.voting_scheme_state })
  end

  it "doesn't change the election status" do
    expect { subject }.not_to change { Election.last.status } .from("key_ceremony")
  end

  context "when the voting scheme generates an answer" do
    let(:public_keys_already_sent) { trustees_plus_keys.map(&:first).excluding(trustee) }

    it "broadcast ok" do
      expect { subject }.to broadcast(:ok)
    end

    it "creates the log entry for the message and another for the response" do
      expect { subject }.to change(LogEntry, :count).by(2)
    end

    it "persists the new state for the voting scheme" do
      expect { subject }.to(change { Election.last.voting_scheme_state })
    end

    it "changes the election status" do
      expect { subject }.to change { Election.last.status } .from("key_ceremony").to("ready")
    end
  end

  shared_examples "key ceremony fails" do
    it "doesn't create a log entry" do
      expect { subject }.not_to change(LogEntry, :count)
    end

    it "doesn't change the voting scheme state" do
      expect { subject }.not_to(change { Election.last.voting_scheme_state })
    end
  end

  it_behaves_like "with an invalid signed data", "key ceremony fails"

  context "when the trustee already sent the message" do
    let(:public_keys_already_sent) { [trustee] }

    it_behaves_like "key ceremony fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The trustee sent their public keys already")
    end
  end

  context "when the data is invalid" do
    let(:extra_message_params) { { content_traits: [:invalid] } }

    it_behaves_like "key ceremony fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The election public key should be a prime number")
    end
  end

  context "when the election status is not key_ceremony" do
    let(:election_status) { :ready }

    it_behaves_like "key ceremony fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The election is not in the right step")
    end
  end

  context "when the client is the authority" do
    let(:trustee) { election.authority }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid)
    end
  end

  context "when the message author is not a trustee" do
    let(:message_id) { "#{election.unique_id}.key_ceremony.trustee_election_keys+x.#{trustee.unique_id}" }
    let(:message) { build(:key_ceremony_message, message_id: message_id, election: election, trustee: trustee) }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid)
    end
  end

  # TODO: test race conditions
end
