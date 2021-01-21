# frozen_string_literal: true

require "rails_helper"

module Mutations
  RSpec.describe ProcessTallyStepMutation, type: :request do
    subject { post "/api", params: { query: query, variables: { messageId: message_id, signedData: signed_data } }, headers: headers }

    let(:query) do
      <<~GQL
        mutation($messageId: String!, $signedData: String!) {
          processTallyStep(messageId: $messageId, signedData: $signedData) {
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

    let!(:election) { create(:election, status: :tally) }
    let(:authority) { Authority.first }
    let(:headers) { { "Authorization": authority.api_key } }
    let(:private_key) { Test::PrivateKeys.authority_private_key }
    let(:signed_data) { JWT.encode(payload.as_json, private_key.keypair, "RS256") }
    let(:payload) { build(:tally_start_message, election: election) }
    let(:message_id) { payload["message_id"] }

    it "adds the message to the pending messages table" do
      expect { subject }.to change(PendingMessage, :count).by(1)
    end

    it "enqueues a tally job to process the message", :jobs do
      subject
      expect(ProcessTallyStepJob).to have_been_enqueued
    end

    it "returns a pending message" do
      subject
      json = JSON.parse(response.body, symbolize_names: true)
      data = json.dig(:data, :processTallyStep)

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
        data = json.dig(:data, :processTallyStep)

        expect(data).to include(
          pendingMessage: nil,
          error: "Client not found"
        )
      end
    end

    context "when sending the message as a trustee" do
      let(:trustee) { Trustee.first }
      let(:private_key) { Test::PrivateKeys.trustees_private_keys.first }
      let(:payload) { build(:tally_share_message, trustee: trustee, election: election) }

      it "adds the message to the pending messages table" do
        expect { subject }.to change(PendingMessage, :count).by(1)
      end

      it "enqueues a tally job to process the message", :jobs do
        subject
        expect(ProcessTallyStepJob).to have_been_enqueued
      end

      it "returns a pending message" do
        subject
        json = JSON.parse(response.body, symbolize_names: true)
        data = json.dig(:data, :processTallyStep)

        expect(data).to include(
          pendingMessage: {
            id: be_present,
            client: {
              id: trustee.unique_id
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
    end
  end
end
