# frozen_string_literal: true

require "rails_helper"

module Mutations
  RSpec.describe PublishResultsMutation, type: :request do
    subject { post "/api", params: { query: query, variables: { messageId: message_id, signedData: signed_data } }, headers: headers }

    let(:query) do
      <<~GQL
        mutation($messageId: String!, $signedData: String!) {
          publishResults(messageId: $messageId, signedData: $signedData) {
            election {
              id
              status
            }
            error
          }
        }
      GQL
    end

    let!(:election) { create(:election, status: :results) }
    let(:authority) { Authority.first }
    let(:headers) { { "Authorization": authority.api_key } }
    let(:signed_data) { JWT.encode(payload.as_json, Test::PrivateKeys.authority_private_key.keypair, "RS256") }
    let(:payload) { build(:publish_results_message, election: election) }
    let(:message_id) { payload["message_id"] }

    it "changes the election status" do
      expect { subject }.to change { Election.last.status } .from("results") .to("results_published")
    end

    it "returns an election status" do
      subject

      json = JSON.parse(response.body, symbolize_names: true)
      data = json.dig(:data, :publishResults)

      expect(data).to include(
        election: {
          id: election.unique_id,
          status: "results_published"
        },
        error: nil
      )
    end

    context "when the authority is not authorized" do
      let(:headers) { {} }

      it "doesn't open the ballot box" do
        expect { subject }.not_to change(election, :status)
      end

      it "returns an error message" do
        subject
        json = JSON.parse(response.body, symbolize_names: true)
        data = json.dig(:data, :publishResults)

        expect(data).to include(
          election: nil,
          error: "Authority not found"
        )
      end
    end
  end
end
