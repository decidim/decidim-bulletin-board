# frozen_string_literal: true

require "rails_helper"

RSpec.describe "GetLogEntry" do
  subject(:result) do
    result = DecidimBulletinBoardSchema.execute(query, context: {})
    raise result["errors"][0]["message"] if result["errors"].present?

    result
  end

  let(:query) do
    <<~GQL
      query GetLogEntry {
        logEntry(electionUniqueId: "#{election_unique_id}", contentHash: "#{content_hash}") {
          messageId
          signedData
          contentHash
        }
      }
    GQL
  end
  let!(:log_entry) { create(:log_entry, election: election, message: build(:vote_message, election: election)) }
  let(:election) { create(:election) }
  let(:election_unique_id) { election.unique_id }
  let(:content_hash) { log_entry.content_hash }

  it "returns the log entry information" do
    expect(subject.deep_symbolize_keys).to include(
      data: {
        logEntry: {
          messageId: log_entry.message_id,
          signedData: log_entry.signed_data,
          contentHash: content_hash
        }
      }
    )
  end

  describe "when the election doesn't exist" do
    let(:election_unique_id) { "foo.bar.1" }

    it { expect(subject.dig("data", "logEntry")).to be_nil }
  end

  describe "when the log entry doesn't exist" do
    let(:content_hash) { "test" }

    it { expect(subject.dig("data", "logEntry")).to be_nil }
  end
end
