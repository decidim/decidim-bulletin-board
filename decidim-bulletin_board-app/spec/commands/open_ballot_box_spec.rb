# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe OpenBallotBox do
  subject { described_class.call(authority, message_id, signed_data) }

  include_context "with a signed message"

  let(:authority) { create(:authority, private_key: private_key) }
  let(:private_key) { generate(:private_key) }
  let!(:election) do
    create(:election, status: election_status,
                      voting_scheme_state: voting_scheme_state)
  end

  let(:election_status) { :ready }
  let(:voting_scheme_state) { nil }
  let(:message_type) { :open_ballot_box_message }
  let(:message_params) { { election: election, authority: authority } }

  it "opens the ballot box" do
    expect { subject }.to broadcast(:ok, election)
  end

  it "creates the log entry for the election activation" do
    expect { subject }.to change(LogEntry, :count).by(1)
  end

  it "doesn't change the election voting scheme state" do
    expect { subject }.not_to(change(election, :voting_scheme_state))
  end

  it "changes the election status" do
    expect { subject }.to change { Election.last.status } .from("ready") .to("vote")
  end

  shared_examples "opening the ballot box fails" do
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

  it_behaves_like "with an invalid signed data", "opening the ballot box fails"

  context "when the election status is not ready" do
    let(:election_status) { :key_ceremony }

    it_behaves_like "opening the ballot box fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The election is not in the right step")
    end
  end

  context "when the client is a trustee" do
    let(:authority) { election.trustees.first }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid)
    end
  end

  context "when the message author is not the authority" do
    let(:trustee) { election.trustees.first }
    let(:message_id) { "#{election.unique_id}.open_ballot_box+t.#{trustee.unique_id}" }
    let(:message) { build(:open_ballot_box_message, message_id: message_id, election: election, trustee: trustee) }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid)
    end
  end
end
