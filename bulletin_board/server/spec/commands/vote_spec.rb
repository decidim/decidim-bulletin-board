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
  let(:message_params) { { election:, voter_id: } }
  let(:voter_id) { generate(:voter_id) }

  it "broadcasts ok" do
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

  it "processes the message with the voting scheme" do
    expect_any_instance_of(described_class).to receive(:process_message) # rubocop:disable RSpec/AnyInstance
    subject
  end

  context "when the vote message is invalid" do
    let(:extra_message_params) { { content_traits: [:invalid] } }

    it "broadcasts invalid" do
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
    let(:client) { create(:authority, private_key:) }
    let(:private_key) { generate(:private_key) }

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the client is a trustee" do
    let(:client) { Trustee.first }
    let(:private_key) { Test::PrivateKeys.trustees_private_keys.first }

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the message author is not a voter" do
    let(:message_id) { "#{election.unique_id}.vote.cast+x.#{voter_id}" }
    let(:extra_message_params) { { message_id: } }

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid message author")
    end
  end

  context "when the voter has already voted in person" do
    let!(:in_person_vote) { create(:log_entry, election:, message: previous_message) }
    let(:previous_message) { build(:in_person_vote_message, election:, voter_id:) }

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Can't cast a vote after voting in person.")
    end
  end

  describe "in person voting" do
    let(:message_type) { :in_person_vote_message }

    it "broadcasts ok" do
      expect { subject }.to broadcast(:ok)
    end

    it "doesn't process the message with the voting scheme" do
      expect_any_instance_of(described_class).not_to receive(:process_message) # rubocop:disable RSpec/AnyInstance
      subject
    end

    context "when the voter has already voted in person" do
      let!(:in_person_vote) { create(:log_entry, election:, message: previous_message) }
      let(:previous_message) { build(:in_person_vote_message, election:, voter_id:) }

      it "broadcasts invalid" do
        expect { subject }.to broadcast(:invalid, "Can't cast a vote after voting in person.")
      end
    end

    context "when the polling station identifier is invalid" do
      let!(:election) { create(:election, election_status, polling_stations: ["another_polling_station"]) }

      it "broadcasts invalid" do
        expect { subject }.to broadcast(:invalid, "Invalid polling station identifier.")
      end
    end
  end
end
