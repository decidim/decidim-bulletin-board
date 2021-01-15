# frozen_string_literal: true

require "rails_helper"

module Mutations
  RSpec.describe ProcessKeyCeremonyStepMutation, type: :request do
    subject { post "/api", params: { query: query, variables: { messageId: message_id, signedData: signed_data } } }

    let(:query) do
      <<~GQL
        mutation($messageId: String!, $signedData: String!) {
          processKeyCeremonyStep(messageId: $messageId, signedData: $signedData) {
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

    let!(:election) { create(:election) }
    let(:trustee) { Trustee.first }
    let(:signed_data) { JWT.encode(payload.as_json, DevPrivateKeys.trustees_private_keys.first.keypair, "RS256") }
    let(:payload) { build(:key_ceremony_message, trustee: trustee, election: election) }
    let(:message_id) { payload["message_id"] }

    it "adds the message to the pending messages table" do
      expect { subject }.to change(PendingMessage, :count).by(1)
    end

    it "enqueues a key ceremony job to process the message", :jobs do
      subject
      expect(ProcessKeyCeremonyStepJob).to have_been_enqueued
    end

    it "returns a pending message" do
      subject
      json = JSON.parse(response.body, symbolize_names: true)
      data = json.dig(:data, :processKeyCeremonyStep)

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

    context "when the trustee is not authorized" do
      let(:trustee) { build(:trustee, private_key: private_key) }
      let(:private_key) { generate(:private_key) }

      it "doesn't create an election" do
        expect { subject }.not_to change(Election, :count)
      end

      it "returns an error message" do
        subject
        json = JSON.parse(response.body, symbolize_names: true)
        data = json.dig(:data, :processKeyCeremonyStep)

        expect(data).to include(
          pendingMessage: nil,
          error: "Trustee not found"
        )
      end
    end
  end
end
