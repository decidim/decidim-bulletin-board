# frozen_string_literal: true

class ValidVotes
  include Enumerable

  def initialize(election)
    @election = election
  end

  def each
    counted_votes = Set.new
    casted_votes.find_each(order: :desc) do |vote|
      next if counted_votes.include?(vote.author_unique_id)

      yield vote
      counted_votes << vote.author_unique_id
    end
  end

  private

  attr_reader :election

  def casted_votes
    ElectionCastedVotes.for(election).where.not(author_unique_id: in_person_voters)
  end

  def in_person_voters
    ElectionInPersonVotes.for(election).select(:author_unique_id)
  end
end
