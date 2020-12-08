# frozen_string_literal: true

require "rails_helper"

RSpec.describe "GetPendingMessage" do
  subject(:result) do
    result = DecidimBulletinBoardSchema.execute(query, context: {})
    raise result["errors"][0]["message"] if result["errors"].present?

    result
  end

  let(:query) do
    <<~GQL
      query GetPendingMessage {
        pendingMessage(id: "#{pending_message_id}") {
          messageId
          signedData
          status
        }
      }
    GQL
  end
  let!(:pending_message) { create(:pending_message, election: election, message: build(:vote_message, election: election)) }
  let(:election) { create(:election) }
  let(:pending_message_id) { pending_message.id }

  it "returns the pending message information" do
    expect(subject.deep_symbolize_keys).to include(
      data: {
        pendingMessage: {
          messageId: pending_message.message_id,
          signedData: pending_message.signed_data,
          status: pending_message.status
        }
      }
    )
  end

  describe "when the pending message doesn't exist" do
    let(:pending_message_id) { "test" }

    it { expect(subject.dig("data", "pendingMessage")).to be_nil }
  end
end
