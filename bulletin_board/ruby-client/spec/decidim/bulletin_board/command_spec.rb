# frozen_string_literal: true

require "spec_helper"
require "wisper/rspec/stub_wisper_publisher"

module Decidim
  module BulletinBoard
    describe Command do
      subject(:command) { described_class.new }

      include_context "with a configured bulletin board"

      describe ".build_message_id" do
        subject { command.build_message_id(unique_election_id, type_subtype, voter_id) }

        let(:unique_election_id) { "decidim-test-authority.26" }
        let(:type_subtype) { "vote.cast" }
        let(:voter_id) { nil }

        it "returns a message_id for the authority" do
          expect(subject).to eq("decidim-test-authority.26.vote.cast+a.decidim-test-authority")
        end

        context "when including a voter_id" do
          let(:voter_id) { "a-great-voter" }

          it "returns a message_id for the voter" do
            expect(subject).to eq("decidim-test-authority.26.vote.cast+v.a-great-voter")
          end
        end
      end

      describe ".complete_message" do
        subject { command.complete_message(message_id, message) }

        let(:message_id) { "a.message.id" }
        let(:message) { { a: "message", with: "data" } }

        it "adds the iat and the message_id" do
          expect(subject).to eq(iat: Time.now.to_i, message_id: "a.message.id", a: "message", with: "data")
        end

        context "when the message includes the message_id" do
          let(:message) { { a: "message", with: "data and", message_id: "that should not be used" } }

          it "overrides the message_id" do
            expect(subject).to eq(iat: Time.now.to_i, message_id: "a.message.id", a: "message", with: "data and")
          end
        end
      end

      describe ".sign_message" do
        subject { command.sign_message(message_id, message) }

        let(:message_id) { "a.message.id" }
        let(:message) { { a: "message", with: "data" } }

        it "uses the private key to sign in the data as JWT" do
          allow(JWT).to receive(:encode)
          subject
          expect(JWT).to have_received(:encode).with({ a: "message", iat: Time.now.to_i, message_id: "a.message.id", with: "data" }, instance_of(OpenSSL::PKey::RSA), "RS256")
        end
      end
    end
  end
end
