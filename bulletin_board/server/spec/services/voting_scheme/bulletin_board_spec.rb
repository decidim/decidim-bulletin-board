# frozen_string_literal: true

require "rails_helper"

module VotingScheme
  RSpec.describe BulletinBoard do
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

      context "when asking for the missing trustee message" do
        let(:type_subtype) { "tally.missing_trustee" }

        it { expect(subject).to be_falsey }
      end

      context "when asking for the tally compensation message" do
        let(:type_subtype) { "tally.compensation" }

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
end
