# frozen_string_literal: true

require "rails_helper"

module Mutations
  RSpec.describe CreateElectionMutation, type: :request do
    subject { post "/api", params: { query: query, variables: { messageId: message_id, signedData: signed_data } }, headers: headers }

    let(:query) do
      <<~GQL
        mutation($messageId: String!, $signedData: String!) {
          createElection(messageId: $messageId, signedData: $signedData) {
            election {
              id
              status
              title
              authority {
                id
              }
            }
          }
        }
      GQL
    end
    let(:headers) { { "Authorization": authority.api_key } }
    let(:authority) { create(:authority, private_key: private_key) }
    let(:message_id) { payload["message_id"] }
    let(:signed_data) { JWT.encode(payload.as_json, signature_key, "RS256") }
    let(:private_key) { generate(:private_key) }
    let(:signature_key) { private_key.keypair }
    let(:payload) { build(:create_election_message, authority: authority) }

    it "setup an election" do
      expect { subject }.to change(Election, :count).by(1)
    end

    it "returns an election" do
      subject
      json = JSON.parse(response.body, symbolize_names: true)
      data = json.dig(:data, :createElection)

      expect(data).to include(
        election: {
          id: be_present,
          status: "key_ceremony",
          title: payload[:description][:name][:text][0][:value],
          authority: {
            id: authority.unique_id
          }
        }
      )
    end
  end
end
