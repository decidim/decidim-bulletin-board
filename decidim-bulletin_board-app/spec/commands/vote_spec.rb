# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe Vote do
  subject { described_class.call(client, message_id, signed_data) }

  include_context "with a signed message"

  let!(:election) { create(:election, election_status) }
  let(:election_status) { :vote }
  let(:client) { Authority.first }
  let(:message_type) { :vote_message }
  let(:message_params) { { election: election } }

  it "broadcast ok" do
    expect { subject }.to broadcast(:ok)
  end

  it "creates the log entry for the message" do
    expect { subject }.to change(LogEntry, :count).by(1)
  end

  it "doesn't change the election voting scheme state" do
    expect { subject }.not_to(change { Election.last.voting_scheme_state })
  end

  it "doesn't change the election status" do
    expect { subject }.not_to change { Election.last.status }.from("vote")
  end

  context "when the vote message is invalid" do
    let(:extra_message_params) { { content_traits: [:invalid] } }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid)
    end

    it "doesn't create the log entry for the message" do
      expect { subject }.not_to change(LogEntry, :count)
    end

    it "doesn't change the election voting scheme state" do
      expect { subject }.not_to(change { Election.last.voting_scheme_state })
    end

    it "doesn't change the election status" do
      expect { subject }.not_to change { Election.last.status }.from("vote")
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
    let(:private_key) { Test::PrivateKeys.trustees_private_keys.first }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the message author is not a voter" do
    let(:message_id) { "#{election.unique_id}.vote.cast+x.#{generate(:voter_id)}" }
    let(:extra_message_params) { { message_id: message_id } }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid message author")
    end
  end
end
