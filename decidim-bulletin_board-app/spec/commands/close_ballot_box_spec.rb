# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe CloseBallotBox do
  subject { described_class.call(client, message_id, signed_data) }

  include_context "with a signed message"

  let!(:election) { create(:election, status: election_status) }
  let(:election_status) { :vote }
  let(:client) { Authority.first }
  let(:message_type) { :close_ballot_box_message }
  let(:message_params) { { election: election } }

  it "closes the ballot box" do
    expect { subject }.to broadcast(:ok, election)
  end

  it "creates the log entry for the election activation" do
    expect { subject }.to change(LogEntry, :count).by(1)
  end

  it "doesn't change the election voting scheme state" do
    expect { subject }.not_to(change(election, :voting_scheme_state))
  end

  it "changes the election status" do
    expect { subject }.to change { Election.last.status } .from("vote") .to("tally")
  end

  shared_examples "closing the ballot box fails" do
    it "doesn't create a log entry" do
      expect { subject }.not_to change(LogEntry, :count)
    end

    it "doesn't change the voting scheme state" do
      expect { subject }.not_to change(election, :voting_scheme_state)
    end

    it "doesn't change the election status" do
      expect { subject }.not_to change(election, :status)
    end
  end

  it_behaves_like "with an invalid signed data", "closing the ballot box fails"

  context "when the election status is not vote" do
    let(:election_status) { :ready }

    it_behaves_like "closing the ballot box fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The election is not in the right step")
    end
  end

  context "when the client is not the election authority" do
    let(:client) { create(:authority, private_key: private_key) }
    let(:private_key) { generate(:private_key) }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the client is a trustee" do
    let(:client) { Trustee.first }
    let(:private_key) { DevPrivateKeys.trustees_private_keys.first }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the message author is not the authority" do
    let(:extra_message_params) { { authority: create(:authority) } }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid message author")
    end
  end
end
