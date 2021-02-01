# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Authority
      describe CreateElection do
        subject { described_class.new(election_id, election_data) }

        include_context "with a configured bulletin board"

        let(:election_id) { 1 }
        let(:election_data) do
          {
            scheme: "dummy"
          }
        end

        let(:bulletin_board_response) do
          {
            createElection: {
              election: {
                status: "created"
              }
            }
          }
        end

        context "when everything is ok" do
          it "broadcasts ok with the result of the graphql mutation" do
            expect { subject.call }.to broadcast(:ok)
          end

          it "build the right message_id" do
            expect(subject.message_id).to eq("decidim-test-authority.1.create_election+a.decidim-test-authority")
          end

          it "uses the graphql client to open the ballot box and return the election" do
            subject.on(:ok) do |election|
              expect(election.status).to eq("created")
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
