# frozen_string_literal: true

require "rails_helper"

RSpec.describe VotingScheme do
  describe ".from_name" do
    subject { described_class.from_name(voting_scheme) }

    let(:voting_scheme) { "dummy" }

    it { expect(subject).to eq(VotingScheme::Dummy) }

    context "when asking for electionguard" do
      let(:voting_scheme) { "election_guard" }

      it { expect(subject).to eq(VotingScheme::ElectionGuard) }
    end

    context "when asking for another voting scheme" do
      let(:voting_scheme) { "other" }

      it { expect(subject).to be_nil }
    end
  end

  describe ".results_message?" do
    subject { described_class.results_message?(voting_scheme, type_subtype) }

    let(:voting_scheme) { "dummy" }
    let(:type_subtype) { "tally.share" }

    it { expect(subject).to be_truthy }

    context "when asking for a non-result message" do
      let(:type_subtype) { "start_tally" }

      it { expect(subject).to be_falsey }
    end

    context "when asking for a scheme that doesn't consider it result" do
      let(:voting_scheme) { "election_guard" }

      it { expect(subject).to be_falsey }
    end
  end
end
