# frozen_string_literal: true

require "spec_helper"
require "wisper/rspec/stub_wisper_publisher"

module Decidim
  module BulletinBoard
    describe Client do
      subject { described_class.new }

      include_context "with a configured bulletin board"

      it { is_expected.to be_configured }

      it "has an identification public key" do
        expect(subject.public_key).not_to be_nil
      end

      context "when private key is not present" do
        let(:identification_private_key) { "" }

        it { is_expected.not_to be_configured }

        it "doesn't have an identification public key" do
          expect(subject.public_key).to be_nil
        end
      end

      context "when server is not present" do
        let(:server) { "" }

        it { is_expected.not_to be_configured }
      end

      context "when api_key is not present" do
        let(:api_key) { "" }

        it { is_expected.not_to be_configured }
      end

      describe "cast_vote" do
        let(:election_data) do
          { election_id: "test.1" }
        end
        let(:voter_data) do
          { voter_id: "voter.1" }
        end
        let(:encrypted_vote) do
          { question_1: "aNsWeR 1" }
        end

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Voter::CastVote", :call, :ok, double(status: "enqueued"))
          end

          it "calls the CastVote command and return the result" do
            pending_message = subject.cast_vote(election_data, voter_data, encrypted_vote)
            expect(pending_message.status).to eq("enqueued")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Voter::CastVote", :call, :error, "something went wrong")
          end

          it "calls the CastVote command and throws an error" do
            expect { subject.cast_vote(election_data, voter_data, encrypted_vote) }.to raise_error("something went wrong")
          end
        end
      end

      describe "get_election_status" do
        let(:election_id) { "decidim-test-authority.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::GetElectionStatus", :call, :ok, "key_ceremony")
          end

          it "calls the GetElectionStatus command and returns the result" do
            election_status = subject.get_status(election_id)
            expect(election_status).to eq("key_ceremony")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::GetElectionStatus", :call, :error, "Sorry, something went wrong")
          end

          it "calls the GetElectionStatus command and throws an error" do
            expect { subject.get_status(election_id) }.to raise_error("Sorry, something went wrong")
          end
        end
      end
    end
  end
end
