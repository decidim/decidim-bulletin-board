# frozen_string_literal: true

# A class used to get all the votes for a given election and voter id
class ElectionVoterVote < Rectify::Query
  def initialize(election, voter_id)
    @election = election
    @voter_id = voter_id
  end

  def self.for(election, voter_id)
    new(election, voter_id).query
  end

  def query
    LogEntry.where(
      election: election,
      author_unique_id: voter_id
    )
  end

  private

  attr_reader :election, :voter_id
end
