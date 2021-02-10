# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Authority
      describe StartKeyCeremony do
        subject(:command) { described_class.new(election_id) }

        include_context "with a configured bulletin board"

        let(:election_id) { "decidim-test-authority.1" }

        let(:bulletin_board_response) do
          {
            startKeyCeremony: {
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
            expect(subject.message_id).to eq("decidim-test-authority.decidim-test-authority.1.start_key_ceremony+a.decidim-test-authority")
          end

          it "uses the graphql client to start the key ceremony and returns its result" do
            subject.on(:ok) do |pending_message|
              expect(pending_message.status).to eq("enqueued")
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
