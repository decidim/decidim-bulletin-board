# frozen_string_literal: true

require "rails_helper"

module Mutations
  RSpec.describe ProcessTallyStepMutation, type: :request do
    subject { post "/api", params: { query:, variables: { messageId: message_id, signedData: signed_data } } }

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

    let!(:election) { create(:election, :tally_started) }
    let(:trustee) { Trustee.first }
    let(:signed_data) { JWT.encode(payload.as_json, Test::PrivateKeys.trustees_private_keys.first.keypair, "RS256") }
    let(:payload) { build(:tally_share_message, trustee:, election:) }
    let(:message_id) { payload["message_id"] }

    it "adds the message to the pending messages table" do
      expect { subject }.to change(PendingMessage, :count).by(1)
    end

    it "enqueues a tally job to process the message", :jobs do
      subject
      expect(ProcessTallyStepJob).to have_been_enqueued
    end

    it "returns a pending message, but doesn't includes the signed_data" do
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
          signedData: nil,
          status: "enqueued"
        },
        error: nil
      )
    end

    context "when the trustee is not authorized" do
      let(:trustee) { build(:trustee, private_key:) }
      let(:private_key) { generate(:private_key) }

      it "doesn't create a pending message" do
        expect { subject }.not_to change(PendingMessage, :count)
      end

      it "returns an error message" do
        subject
        json = JSON.parse(response.body, symbolize_names: true)
        data = json.dig(:data, :processTallyStep)

        expect(data).to include(
          pendingMessage: nil,
          error: "Trustee not found"
        )
      end
    end
  end
end
