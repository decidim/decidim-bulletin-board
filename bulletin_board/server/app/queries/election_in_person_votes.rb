# frozen_string_literal: true

# A class used to get an in person votes for an election
class ElectionInPersonVotes < Rectify::Query
  def initialize(election)
    @election = election
  end

  def self.for(election)
    new(election).query
  end

  def query
    LogEntry.where(
      election:,
      message_type: "vote",
      message_subtype: "in_person"
    )
  end

  private

  attr_reader :election
end
