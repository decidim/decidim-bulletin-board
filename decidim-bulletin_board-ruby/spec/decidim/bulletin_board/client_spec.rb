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

      describe "open_ballot_box" do
        let(:election_id) { "test.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::OpenBallotBox", :call, :ok, double(status: "vote"))
          end

          it "calls the OpenBallotBox command and returns the new status" do
            election = subject.open_ballot_box(election_id)
            expect(election.status).to eq("vote")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::OpenBallotBox", :call, :error, "something went wrong")
          end

          it "calls the CastVote command and throws an error" do
            expect { subject.open_ballot_box(election_id) }.to raise_error("something went wrong")
          end
        end
      end

      describe "close_ballot_box" do
        let(:election_id) { "test.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::CloseBallotBox", :call, :ok, double(status: "tally"))
          end

          it "calls the CloseBallotBox command and returns the new status" do
            election = subject.close_ballot_box(election_id)
            expect(election.status).to eq("tally")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::CloseBallotBox", :call, :error, "something went wrong")
          end

          it "calls the CastVote command and throws an error" do
            expect { subject.close_ballot_box(election_id) }.to raise_error("something went wrong")
          end
        end
      end

      describe "cast_vote" do
        let(:election_id) { "test.1" }
        let(:voter_id) { "voter.1" }
        let(:encrypted_vote) do
          { question_1: "aNsWeR 1" }.to_json
        end

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Voter::CastVote", :call, :ok, double(status: "enqueued"))
          end

          it "calls the CastVote command and return the result" do
            pending_message = subject.cast_vote(election_id, voter_id, encrypted_vote)
            expect(pending_message.status).to eq("enqueued")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Voter::CastVote", :call, :error, "something went wrong")
          end

          it "calls the CastVote command and throws an error" do
            expect { subject.cast_vote(election_id, voter_id, encrypted_vote) }.to raise_error("something went wrong")
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

      describe "start_tally" do
        let(:election_id) { "test.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::StartTally", :call, :ok, double(status: "tally"))
          end

          it "calls the StartTally command and returns the new status" do
            election = subject.start_tally(election_id)
            expect(election.status).to eq("tally")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::StartTally", :call, :error, "something went wrong")
          end

          it "calls the StartTally command and throws an error" do
            expect { subject.start_tally(election_id) }.to raise_error("something went wrong")
          end
        end
      end

      describe "publish_results" do
        let(:election_id) { "decidim-test-authority.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::PublishResults", :call, :ok, "results_published")
          end

          it "calls the PublishResults command and returns the result" do
            election_status = subject.publish_results(election_id)
            expect(election_status).to eq("results_published")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::PublishResults", :call, :error, "Sorry, something went wrong")
          end

          it "calls the PublishResults command and throws an error" do
            expect { subject.publish_results(election_id) }.to raise_error("Sorry, something went wrong")
          end
        end
      end
    end
  end
end
