# frozen_string_literal: true

# A class used to get the last vote casted by each voter in an election
class ElectionUniqueVotes < Rectify::Query
  def initialize(election)
    @election = election
  end

  def query
    LogEntry.where(election: election, message_type: "vote").select("DISTINCT ON (author_unique_id) *").order(:author_unique_id, iat: :desc, id: :desc)
  end

  delegate :each, to: :query

  private

  attr_reader :election
end
