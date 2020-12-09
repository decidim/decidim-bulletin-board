# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Election
      describe GetElectionStatus do
        subject { described_class.new(election_id) }

        let(:election_id) { "decidim-test-authority.1" }

        let(:election_query_response) do
          {
            "data" => {
              "election" => {
                "status" => "key_ceremony"
              }
            }
          }.to_json
        end

        let(:server_url) { "https://example.org/api" }

        before do
          allow(Decidim::BulletinBoard::Graphql::Client).to receive(:client).and_return(
            Graphlient::Client.new(server_url, schema_path: "spec/fixtures/bb_schema.json")
          )
          stub_request(:post, server_url).to_return(status: 200, body: election_query_response)
        end

        context "when everything is ok" do
          it "broadcasts ok with the result of the graphql query" do
            expect { subject.call }.to broadcast(:ok)
          end

          it "uses the graphql client to perform an Election query and return its result" do
            subject.on(:ok) do |election_status|
              expect(election_status).to eq("key_ceremony")
            end
            subject.call
          end
        end

        context "when the graphql operation returns an unexpected error" do
          before do
            stub_request(:post, server_url).to_return(status: 500)
          end

          it "broadcasts error with the unexpected error" do
            expect { subject.call }.to broadcast(:error, "Sorry, something went wrong")
          end
        end
      end
    end
  end
end
