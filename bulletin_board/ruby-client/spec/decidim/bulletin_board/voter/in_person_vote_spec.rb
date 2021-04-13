# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Voter
      describe InPersonVote do
        subject(:command) { described_class.new(election_id, voter_id, polling_station_id) }

        include_context "with a configured bulletin board"

        let(:election_id) { 1 }
        let(:voter_id) { "asdasdafdsaasdq" }
        let(:polling_station_id) { "a polling station identifier" }

        let(:bulletin_board_response) do
          {
            vote: {
              pendingMessage: {
                status: "enqueued"
              }
            }
          }
        end

        context "when everything is ok" do
          it "broadcasts ok with the result of the graphql mutation" do
            expect { subject.call }.to broadcast(:ok)
          end

          it "build the right message_id" do
            expect(subject.message_id).to eq("decidim-test-authority.1.vote.in_person+v.asdasdafdsaasdq")
          end

          it "uses the graphql client to perform a Vote mutation and return its result" do
            subject.on(:ok) do |pending_message|
              expect(pending_message.status).to eq("enqueued")
            end
            subject.call
          end
        end

        context "when the graphql operation returns a expected error" do
          let(:bulletin_board_response) do
            {
              vote: {
                error: "in person vote cannot be registered"
              }
            }
          end

          it "broadcasts error with the expected error message" do
            expect { subject.call }.to broadcast(:error, "in person vote cannot be registered")
          end
        end

        context "when the graphql operation returns an unexpected error" do
          let(:error_response) { true }

          it "broadcasts error with the unexpected error" do
            expect { subject.call }.to broadcast(:error, "something went wrong")
          end
        end
      end
    end
  end
end
