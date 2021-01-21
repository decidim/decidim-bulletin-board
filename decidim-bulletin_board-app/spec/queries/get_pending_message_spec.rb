# frozen_string_literal: true

require "rails_helper"

RSpec.describe "GetPendingMessage" do
  subject { DecidimBulletinBoardSchema.execute(query, context: context) }

  let!(:pending_message) { create(:pending_message, election: election, message: build(:vote_message, election: election)) }
  let(:election) { create(:election) }
  let(:pending_message_id) { pending_message.id }
  let(:context) { {} }
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

  context "when the pending message doesn't exist" do
    let(:pending_message_id) { "test" }

    it { expect(subject.dig("data", "pendingMessage")).to be_nil }
  end

  describe "pending messages with temporary hidden data" do
    let!(:election) { create(:election, :tally) }
    let!(:pending_message) { create(:pending_message, :by_trustee, election: election, message: build(:tally_share_message, election: election)) }

    it "hides the signed data" do
      expect(subject.deep_symbolize_keys).to include(
        data: {
          pendingMessage: {
            messageId: pending_message.message_id,
            signedData: nil,
            status: pending_message.status
          }
        }
      )
    end

    context "when the client is an authority" do
      let(:context) { { api_key: election.authority.api_key } }

      it "shows the signed data" do
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
    end

    context "when the results are published" do
      let(:election) { create(:election, :results_published) }

      it "hides the signed data" do
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
    end
  end
end
