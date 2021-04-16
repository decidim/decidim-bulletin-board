# frozen_string_literal: true

# A class used to get the votes casted in an election
class ElectionCastedVotes < Rectify::Query
  def initialize(election)
    @election = election
  end

  def self.for(election)
    new(election).query
  end

  def query
    LogEntry.includes(:client).where(
      election: election,
      message_type: "vote",
      message_subtype: "cast"
    )
  end

  private

  attr_reader :election
end
