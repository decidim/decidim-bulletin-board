# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Voter
      describe CastVote do
        subject { described_class.new(election_id, voter_id, encrypted_vote) }

        include_context "with a configured bulletin board"

        let(:election_id) { 1 }
        let(:voter_id) { "asdasdafdsaasdq" }
        let(:encrypted_vote) { "a very secret vote" }

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
                error: "vote cannot be emitted"
              }
            }
          end

          it "broadcasts error with the expected error message" do
            expect { subject.call }.to broadcast(:error, "vote cannot be emitted")
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
