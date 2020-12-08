# frozen_string_literal: true

require "rails_helper"

module Mutations
  RSpec.describe OpenBallotBoxMutation, type: :request do
    subject { post "/api", params: { query: query, variables: { messageId: message_id, signedData: signed_data } }, headers: headers }

    let(:query) do
      <<~GQL
        mutation($messageId: String!, $signedData: String!) {
          openBallotBox(messageId: $messageId, signedData: $signedData) {
            election {
              id
              status
            }
            error
          }
        }
      GQL
    end

    let!(:election) { create(:election, authority: authority, authority_private_key: private_key, status: :ready, voting_scheme_state: nil) }
    let(:headers) { { "Authorization": authority.api_key } }
    let(:authority) { create(:authority, private_key: private_key) }
    let(:private_key) { generate(:private_key) }
    let(:signature_key) { private_key.keypair }
    let(:message_id) { payload["message_id"] }
    let(:signed_data) { JWT.encode(payload.as_json, signature_key, "RS256") }
    let(:payload) { build(:open_ballot_box_message, election: election, authority: authority) }

    it "changes the election status" do
      expect { subject }.to change { Election.last.status } .from("ready") .to("vote")
    end

    it "returns an election status" do
      subject

      json = JSON.parse(response.body, symbolize_names: true)
      data = json.dig(:data, :openBallotBox)

      expect(data).to include(
        election: {
          id: election.unique_id,
          status: "vote"
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
        data = json.dig(:data, :openBallotBox)

        expect(data).to include(
          election: nil,
          error: "Authority not found"
        )
      end
    end
  end
end
