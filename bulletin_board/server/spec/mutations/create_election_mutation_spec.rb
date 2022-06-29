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
            error
          }
        }
      GQL
    end
    let(:authority) { Authority.first }
    let(:headers) { { Authorization: authority.api_key } }
    let(:signed_data) { JWT.encode(payload.as_json, Test::PrivateKeys.authority_private_key.keypair, "RS256") }
    let(:payload) { build(:create_election_message) }
    let(:message_id) { payload["message_id"] }

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
          status: "created",
          title: payload[:description][:name][:text].map { |title| [title[:language].to_sym, title[:value]] }.to_h,
          authority: {
            id: authority.unique_id
          }
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
        data = json.dig(:data, :createElection)

        expect(data).to include(
          election: nil,
          error: "Authority not found"
        )
      end
    end
  end
end
