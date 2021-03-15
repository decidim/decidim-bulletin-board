# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe PublishResults do
  subject(:command) { described_class.call(client, message_id, signed_data) }

  include_context "with a signed message"

  let(:election) { Election.find_by(status: election_status) }
  let(:election_status) { :tally_ended }
  let(:client) { Authority.first }
  let(:message_type) { :publish_results_message }
  let(:message_params) { { election: election } }

  it "broadcasts ok" do
    expect { subject }.to broadcast(:ok, election)
  end

  it "creates the log entry for the results publication" do
    expect { subject }.to change(LogEntry, :count).by(1)
  end

  it "doesn't change the election voting scheme state" do
    expect { subject }.not_to(change(election, :voting_scheme_state))
  end

  it "changes the election status" do
    expect { subject }.to change { election.reload.status }.from("tally_ended").to("results_published")
  end

  it "generates the verifiable results file" do
    expect { subject }.to change { election.reload.verifiable_results.attached? }.from(false).to(true)
  end

  it "generates the verifiable results file hash" do
    expect { subject }.to change { election.reload.verifiable_results_hash }.from(nil)
  end

  describe "verifiable results file contents" do
    it "creates one file per each election status" do
      subject
      election.verifiable_results.open do |file|
        expect(`tar -tf #{file.path} | wc -l`.to_i).to eq(Election.statuses.count)
      end
    end

    it "creates one line per each election log entry" do
      subject
      election.verifiable_results.open do |file|
        expect(`tar -axf #{file.path} -O | zcat | wc -l`.to_i).to eq(election.log_entries.count)
      end
    end

    it "each line has the log entry required data" do
      subject
      election.verifiable_results.open do |file|
        `tar -axf #{file.path} -O | zcat`.split("\n").zip(election.log_entries.order(id: :asc)).each do |line, log_entry|
          expect(JSON.parse(line)).to include(log_entry.slice(:message_id, :signed_data, :chained_hash, :content_hash))
        end
      end
    end
  end

  shared_examples "publishing results fails" do
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

  it_behaves_like "with an invalid signed data", "publishing results fails"

  context "when the election status is not results" do
    let(:election_status) { :tally }

    it_behaves_like "publishing results fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The election is not in the right step")
    end
  end

  context "when the client is not the election authority" do
    let(:client) { create(:authority, private_key: private_key) }
    let(:private_key) { generate(:private_key) }

    it_behaves_like "publishing results fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the client is a trustee" do
    let(:client) { Trustee.first }
    let(:private_key) { Test::PrivateKeys.trustees_private_keys.first }

    it_behaves_like "publishing results fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the message author is not the authority" do
    let(:extra_message_params) { { authority: create(:authority) } }

    it_behaves_like "publishing results fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid message author")
    end
  end
end
