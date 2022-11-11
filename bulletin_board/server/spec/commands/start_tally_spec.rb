# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe StartTally do
  subject { described_class.call(client, message_id, signed_data) }

  include_context "with a signed message"

  let!(:election) { create(:election, election_status) }
  let(:election_status) { :vote_ended }
  let(:client) { Authority.first }
  let(:message_type) { :start_tally_message }
  let(:message_params) { { election: } }

  shared_examples "starting the tally fails" do
    it "doesn't create a log entry" do
      expect { subject }.not_to change(LogEntry, :count)
    end

    it "doesn't change the election status" do
      expect { subject }.not_to(change { Election.last.status })
    end
  end

  it "broadcasts ok" do
    expect { subject }.to broadcast(:ok)
  end

  it "creates the log entry for the message and another for the response" do
    expect { subject }.to change(LogEntry, :count).by(2)
  end

  it "persists the new state for the voting scheme" do
    expect { subject }.to(change { Election.last.voting_scheme_state })
  end

  it "change the election status to tally" do
    expect { subject }.to change { Election.last.status }.from("vote_ended").to("tally_started")
  end

  it_behaves_like "with an invalid signed data", "starting the tally fails"

  context "when the election status is not vote_ended" do
    let(:election_status) { :vote }

    it_behaves_like "starting the tally fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The election is not in the right step")
    end
  end

  context "when the client is not the election authority" do
    let(:client) { create(:authority, private_key:) }
    let(:private_key) { generate(:private_key) }

    it_behaves_like "starting the tally fails"

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the client is a trustee" do
    let(:client) { Trustee.first }
    let(:private_key) { Test::PrivateKeys.trustees_private_keys.first }

    it_behaves_like "starting the tally fails"

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the message author is not the right authority" do
    let(:extra_message_params) { { authority: create(:authority) } }

    it_behaves_like "starting the tally fails"

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid message author")
    end
  end
end
