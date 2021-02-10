# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Authority
      describe PublishResults do
        subject(:command) { described_class.new(election_id) }

        include_context "with a configured bulletin board"

        let(:election_id) { "decidim-test-authority.1" }

        let(:bulletin_board_response) do
          {
            publishResults: {
              election: {
                status: "results_published"
              }
            }
          }
        end

        context "when everything is ok" do
          it "broadcasts ok with the result of the graphql mutation" do
            expect { subject.call }.to broadcast(:ok)
          end

          it "build the right message_id" do
            expect(subject.message_id).to eq("decidim-test-authority.decidim-test-authority.1.publish_results+a.decidim-test-authority")
          end

          it "uses the graphql client to publish the election results and returns its result" do
            subject.on(:ok) do |election|
              expect(election.status).to eq("results_published")
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
