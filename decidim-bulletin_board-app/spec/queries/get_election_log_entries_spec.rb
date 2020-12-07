# frozen_string_literal: true

require "rails_helper"

RSpec.describe "GetElectionLogEntries" do
  let(:result) do
    result = DecidimBulletinBoardSchema.execute(query, context: context)
    raise result["errors"][0]["message"] if result["errors"].present?

    result
  end
  let(:context) { {} }
  let(:query) do
    <<~GQL
      query GetElectionLogEntries {
        election(uniqueId: "#{election_unique_id}") {
          logEntries {
            messageId
            signedData
          }
        }
      }
    GQL
  end
  let(:election) { create(:election) }

  describe "when the election exists" do
    let(:election_unique_id) { election.unique_id }

    it "returns the election's log entries" do
      log_entries = result.dig("data", "election", "logEntries")
      expect(log_entries.length).to eq(1)
    end
  end

  describe "when the election doesn't exist" do
    let(:election_unique_id) { "foo.bar.1" }

    it "returns nil" do
      election = result.dig("data", "election")
      expect(election).to be_nil
    end
  end
end
