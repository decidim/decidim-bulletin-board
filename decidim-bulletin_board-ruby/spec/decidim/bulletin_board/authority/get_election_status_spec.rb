# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Authority
      describe GetElectionStatus do
        subject(:command) { described_class.new(election_id) }

        include_context "with a configured bulletin board"

        let(:election_id) { 1 }

        let(:bulletin_board_response) do
          {
            election: {
              status: "key_ceremony"
            }
          }
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
          let(:error_response) { true }

          it "broadcasts error with the unexpected error" do
            expect { subject.call }.to broadcast(:error, "Sorry, something went wrong")
          end
        end
      end
    end
  end
end
