# frozen_string_literal: true

require "spec_helper"
require "wisper/rspec/stub_wisper_publisher"

module Decidim
  module BulletinBoard
    describe Client do
      subject(:instance) { described_class.new }

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

      describe "start_key_ceremony" do
        subject { instance.start_key_ceremony(election_id) }

        let(:election_id) { "test.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::StartKeyCeremony", :call, :ok, double(status: "enqueued"))
          end

          it "calls the StartKeyCeremony command and returns the result" do
            expect(subject.status).to eq("enqueued")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::StartKeyCeremony", :call, :error, "something went wrong")
          end

          it "calls the StartKeyCeremony command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "start_vote" do
        subject { instance.start_vote(election_id) }

        let(:election_id) { "test.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::StartVote", :call, :ok, double(status: "enqueued"))
          end

          it "calls the StartVote command and return the result" do
            expect(subject.status).to eq("enqueued")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::StartVote", :call, :error, "something went wrong")
          end

          it "calls the StartVote command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "cast_vote_message_id" do
        let(:election_id) { "test.1" }
        let(:voter_id) { "voter.1" }

        context "when everything went ok" do
          it "calls the cast_vote_message_id method and returns message_id" do
            message_id = subject.cast_vote_message_id(election_id, voter_id)
            expect(message_id).to eq("decidim-test-authority.test.1.vote.cast+v.voter.1")
          end
        end
      end

      describe "cast_vote" do
        subject { instance.cast_vote(election_id, voter_id, encrypted_vote) }

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
            expect(subject.status).to eq("enqueued")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Voter::CastVote", :call, :error, "something went wrong")
          end

          it "calls the CastVote command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "end_vote" do
        subject { instance.end_vote(election_id) }

        let(:election_id) { "test.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::EndVote", :call, :ok, double(status: "enqueued"))
          end

          it "calls the EndVote command and returns the result" do
            expect(subject.status).to eq("enqueued")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::EndVote", :call, :error, "something went wrong")
          end

          it "calls the EndVote command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "get_pending_message_status" do
        let(:message_id) { "decidim-test-authority.test.1.vote.cast+v.voter.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Voter::GetPendingMessageStatus", :call, :ok, "accepted")
          end

          it "calls the GetPendingMessageStatus command and returns the result" do
            get_pending_message_status = subject.get_pending_message_status(message_id)
            expect(get_pending_message_status).to eq("accepted")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Voter::GetPendingMessageStatus", :call, :error, "Sorry, something went wrong")
          end

          it "calls the GetPendingMessageStatus command and throws an error" do
            expect { subject.get_pending_message_status(message_id) }.to raise_error("Sorry, something went wrong")
          end
        end
      end

      describe "get_election_status" do
        subject { instance.get_election_status(election_id) }

        let(:election_id) { "decidim-test-authority.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::GetElectionStatus", :call, :ok, "key_ceremony")
          end

          it "calls the GetElectionStatus command and returns the result" do
            expect(subject).to eq("key_ceremony")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::GetElectionStatus", :call, :error, "Sorry, something went wrong")
          end

          it "calls the GetElectionStatus command and throws an error" do
            expect { subject }.to raise_error("Sorry, something went wrong")
          end
        end
      end

      describe "start_tally" do
        subject { instance.start_tally(election_id) }

        let(:election_id) { "test.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::StartTally", :call, :ok, double(status: "enqueued"))
          end

          it "calls the StartTally command and returns the result" do
            expect(subject.status).to eq("enqueued")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::StartTally", :call, :error, "something went wrong")
          end

          it "calls the StartTally command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "publish_results" do
        subject { instance.publish_results(election_id) }

        let(:election_id) { "decidim-test-authority.1" }

        context "when everything went ok" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::PublishResults", :call, :ok, "results_published")
          end

          it "calls the PublishResults command and returns the result" do
            expect(subject).to eq("results_published")
          end
        end

        context "when something went wrong" do
          before do
            stub_wisper_publisher("Decidim::BulletinBoard::Authority::PublishResults", :call, :error, "Sorry, something went wrong")
          end

          it "calls the PublishResults command and throws an error" do
            expect { subject }.to raise_error("Sorry, something went wrong")
          end
        end
      end
    end
  end
end
