# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe Vote do
  subject { described_class.call(authority, message_id, signed_data) }

  include_context "with a signed message"

  let!(:election) { create(:election, status: election_status) }
  let(:election_status) { :vote }
  let(:authority) { create(:authority, private_key: private_key) }
  let(:message_type) { :vote_message }
  let(:message_params) { { election: election, authority: authority } }

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
    expect { subject }.not_to change { Election.last.status } .from("vote")
  end

  context "when the vote message is invalid" do
    let(:extra_message_params) { { content_traits: [ :invalid ] } }

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
      expect { subject }.not_to change { Election.last.status } .from("vote")
    end
  end

  context "when the client is a trustee" do
    let(:authority) { election.trustees.first }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid)
    end
  end

  context "when the message author is not a voter" do
    let(:message_id) { "#{election.unique_id}.vote.cast+x.#{generate(:voter_id)}" }
    let(:message) { build(:vote_message, message_id: message_id, election: election) }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid)
    end
  end
end
