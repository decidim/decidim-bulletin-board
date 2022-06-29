# frozen_string_literal: true

require "rails_helper"

module Mutations
  RSpec.describe EndVoteMutation, type: :request do
    subject { post "/api", params: { query: query, variables: { messageId: message_id, signedData: signed_data } }, headers: headers }

    let(:query) do
      <<~GQL
        mutation($messageId: String!, $signedData: String!) {
          endVote(messageId: $messageId, signedData: $signedData) {
            pendingMessage {
              id
              client {
                id
              }
              election {
                id
              }
              signedData
              status
            }
            error
          }
        }
      GQL
    end

    let!(:election) { create(:election, :vote) }
    let(:authority) { Authority.first }
    let(:headers) { { Authorization: authority.api_key } }
    let(:signed_data) { JWT.encode(payload.as_json, Test::PrivateKeys.authority_private_key.keypair, "RS256") }
    let(:payload) { build(:end_vote_message, election: election) }
    let(:message_id) { payload["message_id"] }

    it "adds the message to the pending messages table" do
      expect { subject }.to change(PendingMessage, :count).by(1)
    end

    it "returns a pending message" do
      subject
      json = JSON.parse(response.body, symbolize_names: true)
      data = json.dig(:data, :endVote)

      expect(data).to include(
        pendingMessage: {
          id: be_present,
          client: {
            id: authority.unique_id
          },
          election: {
            id: election.unique_id
          },
          signedData: signed_data,
          status: "enqueued"
        },
        error: nil
      )
    end

    context "when the authority is not authorized" do
      let(:headers) { {} }

      it "doesn't create a pending message" do
        expect { subject }.not_to change(PendingMessage, :count)
      end

      it "returns an error message" do
        subject
        json = JSON.parse(response.body, symbolize_names: true)
        data = json.dig(:data, :endVote)

        expect(data).to include(
          pendingMessage: nil,
          error: "Authority not found"
        )
      end
    end
  end
end
