# frozen_string_literal: true

require "rails_helper"

module Mutations
  RSpec.describe CreateElectionMutation, type: :request do
    subject { post "/api", params: { query: query, variables: { signedData: signed_data } }, headers: headers }

    let(:query) do
      <<~GQL
        mutation($signedData: String!) {
          createElection(signedData: $signedData) {
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
    let(:private_key) { generate(:private_key) }
    let(:authority) { create(:authority, private_key: private_key) }
    let(:signature_key) { private_key.keypair }
    let(:signed_data) { JWT.encode(payload.as_json, signature_key, "RS256") }
    let(:payload) { build(:create_election_message, authority: authority) }

    it "setups an election" do
      expect { subject }.to change(Election, :count).by(1)
    end

    it "returns an election" do
      subject
      json = JSON.parse(response.body)
      data = json["data"]["createElection"].deep_symbolize_keys

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
