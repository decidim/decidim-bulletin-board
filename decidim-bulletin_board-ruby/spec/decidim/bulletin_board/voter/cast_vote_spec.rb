# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Voter
      describe CastVote do
        subject { described_class.new(form) }
        let(:form) { double(valid?: valid, errors: errors, message_id: message_id, signed_data: signed_data) }
        let(:valid) { true }
        let(:errors) { nil }
        let(:message_id) { "test.1.vote.cast+v.voter.1"}
        let(:signed_data) { "123456789" }

        let(:vote_mutation_response) do
          {
            "data" => {
              "vote" => {
                "pendingMessage" => {
                  "status" => "enqueued"
                }
              }
            }
          }.to_json
        end
        let(:server_url) { "https://example.org/api" }

        before do
          allow(Decidim::BulletinBoard::Graphql::Client).to receive(:client).and_return(
            Graphlient::Client.new(server_url, schema_path: "spec/fixtures/bb_schema.json")
          )
          stub_request(:post, server_url).to_return(status: 200, body: vote_mutation_response)
        end

        context "when everything is ok" do
          before do
          end

          it "broadcasts ok with the result of the graphql mutation" do
            expect { subject.call }.to broadcast(:ok)
          end

          it "uses the graphql client to perform a Vote mutation and return its result" do
            subject.on(:ok) do |pending_message|
              expect(pending_message.status).to eq("enqueued")
            end
            subject.call
          end
        end

        context "when the form is not valid" do
          let(:valid) { false }
          let(:errors) { double(full_messages: ["something went wrong"]) }

          it "broadcasts error with the form error messages" do
            expect { subject.call }.to broadcast(:error, "something went wrong")
          end
        end

        context "when the graphql operation returns a expected error" do
          let(:vote_mutation_response) do
            {
              "data" => {
                "vote" => {
                  "error" => "vote cannot be emitted"
                }
              }
            }.to_json
          end

          it "broadcasts error with the expected error message" do
            expect { subject.call }.to broadcast(:error, "vote cannot be emitted")
          end
        end

        context "when the graphql operation returns an unexpected error" do
          before do
            stub_request(:post, server_url).to_return(status: 500)
          end

          it "broadcasts error with the unexpected error" do
            expect { subject.call }.to broadcast(:error, "something went wrong")
          end
        end
      end
    end
  end
end

