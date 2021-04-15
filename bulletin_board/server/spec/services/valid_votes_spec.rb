# frozen_string_literal: true

require "rails_helper"

RSpec.describe ValidVotes do
  subject(:instance) { described_class.new(election).to_a }

  let(:election) { create(:election, :vote) }
  let(:some_votes) { create_list(:log_entry, 10, :vote, election: election) }
  let(:create_votes) { some_votes }

  before { create_votes }

  it { expect(subject).to match_array(some_votes) }

  context "when there are duplicated votes" do
    let(:replacement) { create(:log_entry, :vote, election: election, voter_id: some_votes.first.author_unique_id) }
    let(:create_votes) { some_votes && replacement }

    it { expect(subject).to match_array(some_votes.excluding(some_votes.first).append(replacement)) }
  end

  context "when there are in_person votes" do
    let(:replacement) { create(:log_entry, :in_person_vote, election: election, voter_id: some_votes.first.author_unique_id) }
    let(:create_votes) { some_votes && replacement }

    it { expect(subject).to match_array(some_votes.excluding(some_votes.first)) }
  end
end
