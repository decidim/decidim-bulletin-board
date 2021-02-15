# frozen_string_literal: true

require "spec_helper"
require "wisper/rspec/stub_wisper_publisher"

module Decidim
  module BulletinBoard
    describe Client do
      subject(:instance) { described_class.new(config) }

      include_context "with a configured bulletin board"

      it { is_expected.to be_configured }

      describe "start_key_ceremony" do
        subject { instance.start_key_ceremony(election_id) }

        before do
          stub_command("Decidim::BulletinBoard::Authority::StartKeyCeremony", :call, *result)
        end

        let(:election_id) { "test.1" }
        let(:result) { [:ok, double(status: "enqueued")] }

        it "yields the message_id" do
          expect { |block| instance.start_key_ceremony(election_id, &block) }.to yield_with_args("a.message+id")
        end

        it "calls the StartKeyCeremony command and returns the result" do
          expect(subject.status).to eq("enqueued")
        end

        context "when something went wrong" do
          let(:result) { [:error, "something went wrong"] }

          it "calls the StartKeyCeremony command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "start_vote" do
        subject { instance.start_vote(election_id) }

        before do
          stub_command("Decidim::BulletinBoard::Authority::StartVote", :call, *result)
        end

        let(:election_id) { "test.1" }
        let(:result) { [:ok, double(status: "enqueued")] }

        it "yields the message_id" do
          expect { |block| instance.start_vote(election_id, &block) }.to yield_with_args("a.message+id")
        end

        it "calls the StartVote command and return the result" do
          expect(subject.status).to eq("enqueued")
        end

        context "when something went wrong" do
          let(:result) { [:error, "something went wrong"] }

          it "calls the StartVote command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "cast_vote" do
        subject { instance.cast_vote(election_id, voter_id, encrypted_vote) }

        before do
          stub_command("Decidim::BulletinBoard::Voter::CastVote", :call, *result)
        end

        let(:election_id) { "test.1" }
        let(:voter_id) { "voter.1" }
        let(:encrypted_vote) do
          { question_1: "aNsWeR 1" }.to_json
        end
        let(:result) { [:ok, double(status: "enqueued")] }

        it "yields the message_id" do
          expect { |block| instance.cast_vote(election_id, voter_id, encrypted_vote, &block) }.to yield_with_args("a.message+id")
        end

        it "calls the CastVote command and return the result" do
          expect(subject.status).to eq("enqueued")
        end

        context "when something went wrong" do
          let(:result) { [:error, "something went wrong"] }

          it "calls the CastVote command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "end_vote" do
        subject { instance.end_vote(election_id) }

        before do
          stub_command("Decidim::BulletinBoard::Authority::EndVote", :call, *result)
        end

        let(:election_id) { "test.1" }
        let(:result) { [:ok, double(status: "enqueued")] }

        it "calls the EndVote command and returns the result" do
          expect(subject.status).to eq("enqueued")
        end

        context "when something went wrong" do
          let(:result) { [:error, "something went wrong"] }

          it "calls the EndVote command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "get_pending_message_status" do
        let(:message_id) { "decidim-test-authority.test.1.vote.cast+v.voter.1" }

        context "when everything went ok" do
          before do
            stub_command("Decidim::BulletinBoard::Voter::GetPendingMessageStatus", :call, :ok, "accepted")
          end

          it "calls the GetPendingMessageStatus command and returns the result" do
            get_pending_message_status = subject.get_pending_message_status(message_id)
            expect(get_pending_message_status).to eq("accepted")
          end
        end

        context "when something went wrong" do
          before do
            stub_command("Decidim::BulletinBoard::Voter::GetPendingMessageStatus", :call, :error, "Sorry, something went wrong")
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
            stub_command("Decidim::BulletinBoard::Authority::GetElectionStatus", :call, :ok, "key_ceremony")
          end

          it "calls the GetElectionStatus command and returns the result" do
            expect(subject).to eq("key_ceremony")
          end
        end

        context "when something went wrong" do
          before do
            stub_command("Decidim::BulletinBoard::Authority::GetElectionStatus", :call, :error, "Sorry, something went wrong")
          end

          it "calls the GetElectionStatus command and throws an error" do
            expect { subject }.to raise_error("Sorry, something went wrong")
          end
        end
      end

      describe "start_tally" do
        subject { instance.start_tally(election_id) }

        before do
          stub_command("Decidim::BulletinBoard::Authority::StartTally", :call, *result)
        end

        let(:election_id) { "test.1" }
        let(:result) { [:ok, double(status: "enqueued")] }

        it "yields the message_id" do
          expect { |block| instance.start_tally(election_id, &block) }.to yield_with_args("a.message+id")
        end

        it "calls the StartTally command and returns the result" do
          expect(subject.status).to eq("enqueued")
        end

        context "when something went wrong" do
          let(:result) { [:error, "something went wrong"] }

          it "calls the StartTally command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "get_election_results" do
        subject { instance.get_election_results(election_id) }

        before do
          stub_command("Decidim::BulletinBoard::Authority::GetElectionResults", :call, *result)
        end

        let(:election_id) { "test.1" }
        let(:result) { [:ok, double(results: { "23" => { "66" => 0, "67" => 0, "68" => 0, "69" => 4 }, "24" => { "70" => 0, "71" => 1, "72" => 1 } })] }

        it "calls the GetElectionResults command and returns the result" do
          expect(subject.results).to eq({ "23" => { "66" => 0, "67" => 0, "68" => 0, "69" => 4 }, "24" => { "70" => 0, "71" => 1, "72" => 1 } })
        end

        context "when something went wrong" do
          let(:result) { [:error, "something went wrong"] }

          it "calls the GetElectionLogEntriesByTypes command and throws an error" do
            expect { subject }.to raise_error("something went wrong")
          end
        end
      end

      describe "publish_results" do
        subject { instance.publish_results(election_id) }

        before do
          stub_command("Decidim::BulletinBoard::Authority::PublishResults", :call, *result)
        end

        let(:election_id) { "decidim-test-authority.1" }
        let(:result) { [:ok, "results_published"] }

        it "yields the message_id" do
          expect { |block| instance.publish_results(election_id, &block) }.to yield_with_args("a.message+id")
        end

        it "calls the PublishResults command and returns the result" do
          expect(subject).to eq("results_published")
        end

        context "when something went wrong" do
          let(:result) { [:error, "Sorry, something went wrong"] }

          it "calls the PublishResults command and throws an error" do
            expect { subject }.to raise_error("Sorry, something went wrong")
          end
        end
      end
    end
  end
end
