# frozen_string_literal: true

require "rails_helper"

RSpec.describe VotingScheme do
  describe ".from_name" do
    subject { described_class.from_name(voting_scheme) }

    let(:voting_scheme) { "dummy" }

    it { expect(subject).to eq({ bulletin_board: VotingScheme::Dummy::BulletinBoard }) }

    context "when asking for electionguard" do
      let(:voting_scheme) { "electionguard" }

      it { expect(subject).to eq({ bulletin_board: VotingScheme::Electionguard::BulletinBoard }) }
    end

    context "when asking for another voting scheme" do
      let(:voting_scheme) { "other" }

      it { expect(subject).to be_nil }
    end
  end

  describe ".results_message?" do
    subject { described_class.results_message?(voting_scheme, type_subtype) }

    let(:voting_scheme) { "dummy" }
    let(:type_subtype) { "end_tally" }

    it { expect(subject).to be_truthy }

    context "when asking for a non-result message" do
      let(:type_subtype) { "start_tally" }

      it { expect(subject).to be_falsey }
    end

    context "when asking for the tally shares message" do
      let(:type_subtype) { "tally.share" }

      it { expect(subject).to be_truthy }
    end

    context "when using the electionguard voting scheme" do
      let(:voting_scheme) { "electionguard" }

      it { expect(subject).to be_truthy }

      context "when asking for a non-result message" do
        let(:type_subtype) { "start_tally" }

        it { expect(subject).to be_falsey }
      end

      context "when asking for the tally shares message" do
        let(:type_subtype) { "tally.trustee_share" }

        it { expect(subject).to be_truthy }
      end
    end
  end
end
