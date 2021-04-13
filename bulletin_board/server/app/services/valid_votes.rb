# frozen_string_literal: true

class ValidVotes
  def initialize(election)
    @election = election
  end

  def each
    counted_votes = ElectionInPersonVotes.for(election).pluck(:author_unique_id).to_set
    ElectionCastedVotes.for(election).find_each(order: :desc) do |vote|
      next if counted_votes.include?(vote)

      yield vote
      counted_votes << vote
    end
  end
end
