# frozen_string_literal: true

require "rails_helper"

module Mutations
  RSpec.describe ProcessKeyCeremonyStepMutation, type: :request do
    subject { post "/api", params: { query: query, variables: { signedData: signed_data } }, headers: headers }

    let(:query) do
      <<~GQL
        mutation($signedData: String!) {
          processKeyCeremonyStep(signedData: $signedData) {
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
          }
        }
      GQL
    end

    let!(:election) { create(:election, trustees_plus_keys: trustees_plus_keys) }
    let(:headers) { { "Authorization": trustee.unique_id } }
    let(:trustees_plus_keys) { generate_list(:private_key, 3).map { |key| [create(:trustee, private_key: key), key] } }
    let(:trustee) { trustees_plus_keys.first.first }
    let(:private_key) { trustees_plus_keys.first.last }
    let(:signature_key) { private_key.keypair }
    let(:signed_data) { JWT.encode(payload.as_json, signature_key, "RS256") }
    let(:payload) { build(:key_ceremony_message, trustee: trustee) }

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
          election: nil,
          status: "enqueued",
          signedData: signed_data,
          client: {
            id: trustee.unique_id
          }
        }
      )
    end
  end
end
