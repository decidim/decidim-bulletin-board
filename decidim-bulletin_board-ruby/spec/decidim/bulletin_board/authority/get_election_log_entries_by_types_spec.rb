# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Authority
      describe GetElectionLogEntriesByTypes do
        subject { described_class.new(election_id, types) }

        include_context "with a configured bulletin board"

        let(:election_id) { "decidim-test-authority.1" }
        let(:types) { ["tally_ended"] }
        let(:bulletin_board_response) do
          {
            election: {
              logEntries: [{
                signedData: "1234567"
              }]
            }
          }
        end

        context "when everything is ok" do
          it "broadcasts ok with the result of the graphql query" do
            expect { subject.call }.to broadcast(:ok)
          end

          it "uses the graphql client to perform an election query and return its result" do
            subject.on(:ok) do |log_entries|
              expect(log_entries.first.signed_data).to eq("1234567")
            end
            subject.call
          end
        end

        context "when the graphql operation returns an unexpected error" do
          let(:error_response) { true }

          it "broadcasts error with the unexpected error" do
            expect { subject.call }.to broadcast(:error, "Sorry, something went wrong")
          end
        end
      end
    end
  end
end
