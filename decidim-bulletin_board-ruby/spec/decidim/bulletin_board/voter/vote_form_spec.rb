# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Voter
      describe VoteForm do
        subject { described_class.new(bulletin_board_client, election_data, voter_data, encrypted_vote) }

        let(:bulletin_board_client) { double(sign_data: "123456789") }
        let(:election_data) do
          { election_id: "test.1" }
        end
        let(:voter_data) do
          { voter_id: "voter.1" }
        end
        let(:encrypted_vote) { "{ \"question_1\": \"aNsWeR 1\" }" }

        describe("when the election data doesn't include the election_id") do
          let(:election_data) do
            { foo: "bar" }
          end

          it { is_expected.not_to be_valid }
        end

        describe("when the voter data doesn't include the voter_id") do
          let(:voter_data) do
            { foo: "bar" }
          end

          it { is_expected.not_to be_valid }
        end

        describe("when the encrypted vote is not present") do
          let(:encrypted_vote) { nil }

          it { is_expected.not_to be_valid }
        end

        describe "message_id" do
          it "returns a string including the necessary info to cast a vote" do
            expect(subject.message_id).to eq("test.1.vote.cast+v.voter.1")
          end
        end

        describe "signed_data" do
          it "returns a string with the encrypted vote signed by the authority" do
            expect(subject.signed_data).to eq("123456789")
          end
        end
      end
    end
  end
end
