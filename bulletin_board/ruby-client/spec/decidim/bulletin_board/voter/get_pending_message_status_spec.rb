# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Voter
      describe GetPendingMessageStatus do
        subject(:command) { described_class.new(message_id) }

        include_context "with a configured bulletin board"

        let(:message_id) { "decidim-barcelona.26.vote.cast+v.50ad41624c25e493aa1dc7f4ab32bdc5a3b0b78ecc35b539" }

        let(:bulletin_board_response) do
          {
            pendingMessage: {
              status: "accepted"
            }
          }
        end

        context "when everything is ok" do
          it "broadcasts ok with the result of the graphql query" do
            expect { subject.call }.to broadcast(:ok)
          end

          it "uses the graphql client to perform a Vote query and return its result" do
            subject.on(:ok) do |pending_message_status|
              expect(pending_message_status).to eq("accepted")
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
