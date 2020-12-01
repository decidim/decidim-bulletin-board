# frozen_string_literal: true

require "rails_helper"

module Mutations
  RSpec.describe VoteMutation, type: :request do
    subject { post "/api", params: { query: query, variables: { messageId: message_id, signedData: signed_data } }, headers: headers }

    let(:query) do
      <<~GQL
        mutation($messageId: String!, $signedData: String!) {
          vote(messageId: $messageId, signedData: $signedData) {
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

    let!(:election) { create(:election, authority: authority) }
    let(:headers) { { "Authorization": authority.api_key } }
    let(:authority) { create(:authority, private_key: private_key) }
    let(:message_id) { payload["message_id"] }
    let(:signed_data) { JWT.encode(payload.as_json, signature_key, "RS256") }
    let(:private_key) { generate(:private_key) }
    let(:signature_key) { private_key.keypair }
    let(:payload) { build(:vote_message, election: election, authority: authority) }

    it "adds the message to the pending messages table" do
      expect { subject }.to change(PendingMessage, :count).by(1)
    end

    it "enqueues a key ceremony job to process the message", :jobs do
      subject
      expect(VoteJob).to have_been_enqueued
    end

    it "returns a pending message" do
      subject
      json = JSON.parse(response.body, symbolize_names: true)
      data = json.dig(:data, :vote)

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

      it "doesn't create an election" do
        expect { subject }.not_to change(Election, :count)
      end

      it "returns an error message" do
        subject
        json = JSON.parse(response.body, symbolize_names: true)
        data = json.dig(:data, :vote)

        expect(data).to include(
          pendingMessage: nil,
          error: "Authority not found"
        )
      end
    end
  end
end
