# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe ProcessKeyCeremonyStep do
  subject { described_class.call(client, message_id, signed_data) }

  include_context "with a signed message"

  let!(:election) { create(:election, status: election_status, voting_scheme_state: voting_scheme_state) }
  let(:election_status) { :key_ceremony }
  let(:voting_scheme_state) { Marshal.dump(joint_election_key: 1, trustees: public_keys_already_sent.map(&:unique_id)) }
  let(:public_keys_already_sent) { [] }
  let(:trustee) { Trustee.first }
  let(:client) { trustee }
  let(:private_key) { Test::PrivateKeys.trustees_private_keys.first }
  let(:message_type) { :key_ceremony_message }
  let(:message_params) { { election: election, trustee: trustee } }

  it "broadcasts ok" do
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
    let(:public_keys_already_sent) { Trustee.first(3).excluding(trustee) }

    it "broadcasts ok" do
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

  context "when the data is invalid" do
    let(:extra_message_params) { { content_traits: [:invalid] } }

    it_behaves_like "key ceremony fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The owner_id doesn't match the sender trustee")
    end
  end

  context "when the trustee already sent the message" do
    let(:public_keys_already_sent) { [trustee] }

    it_behaves_like "key ceremony fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The trustee already sent their public key")
    end
  end

  context "when the election status is not key_ceremony" do
    let(:election_status) { :ready }

    it_behaves_like "key ceremony fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The election is not in the right step")
    end
  end

  context "when the client is not an election trustee" do
    let(:trustee) { create(:trustee, private_key: private_key) }
    let(:private_key) { generate(:private_key) }

    it_behaves_like "key ceremony fails"

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the client is the election authority" do
    let(:client) { election.authority }
    let(:private_key) { Test::PrivateKeys.authority_private_key }

    it_behaves_like "key ceremony fails"

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the message author is not the same trustee" do
    let(:extra_message_params) { { trustee: create(:trustee) } }

    it_behaves_like "key ceremony fails"

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid message author")
    end
  end
end
