# frozen_string_literal: true

require "rails_helper"

RSpec.describe VotingScheme do
  describe ".from_name" do
    subject { described_class.from_name(voting_scheme) }

    let(:voting_scheme) { "dummy" }

    it do
      expect(subject).to eq(
        {
          bulletin_board: VotingScheme::Dummy::BulletinBoard,
          voter: VotingScheme::Dummy::Voter
        }
      )
    end

    context "when asking for electionguard" do
      let(:voting_scheme) { "electionguard" }

      it do
        expect(subject).to eq(
          {
            bulletin_board: VotingScheme::Electionguard::BulletinBoard,
            voter: VotingScheme::Electionguard::Voter
          }
        )
      end
    end

    context "when asking for another voting scheme" do
      let(:voting_scheme) { "other" }

      it do
        expect(subject).to eq(
          {
            bulletin_board: nil,
            voter: nil
          }
        )
      end
    end
  end
end
