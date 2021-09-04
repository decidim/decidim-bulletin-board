# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe ReportMissingTrustee do
  subject { described_class.call(client, message_id, signed_data) }

  include_context "with a signed message"

  let!(:election) { create(:election, election_status) }
  let(:election_status) { :tally }
  let(:client) { Authority.first }
  let(:message_type) { :report_missing_trustee_message }
  let(:message_params) { { election: election } }

  shared_examples "reporting the missing trustee fails" do
    it "doesn't create a log entry" do
      expect { subject }.not_to change(LogEntry, :count)
    end
  end

  it "broadcasts ok" do
    expect { subject }.to broadcast(:ok)
  end

  it "creates the log entry for the message" do
    expect { subject }.to change(LogEntry, :count).by(1)
  end

  it "persists the new state for the voting scheme" do
    expect { subject }.to(change { Election.last.voting_scheme_state })
  end

  it_behaves_like "with an invalid signed data", "reporting the missing trustee fails"

  context "when the election status is not tally" do
    let(:election_status) { :vote_ended }

    it_behaves_like "reporting the missing trustee fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The election is not in the right step")
    end
  end

  context "when the client is not the election authority" do
    let(:client) { create(:authority, private_key: private_key) }
    let(:private_key) { generate(:private_key) }

    it_behaves_like "reporting the missing trustee fails"

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the client is a trustee" do
    let(:client) { Trustee.first }
    let(:private_key) { Test::PrivateKeys.trustees_private_keys.first }

    it_behaves_like "reporting the missing trustee fails"

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the message author is not the right authority" do
    let(:extra_message_params) { { authority: create(:authority) } }

    it_behaves_like "reporting the missing trustee fails"

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid message author")
    end
  end
end
