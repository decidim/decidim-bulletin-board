# frozen_string_literal: true

require "voting_scheme/bulletin_board"
require "voting_scheme/dummy/bulletin_board"
require "voting_scheme/electionguard/bulletin_board"

module VotingScheme
  VOTING_SCHEME = {
    dummy: Dummy,
    electionguard: Electionguard
  }.freeze

  def self.from_name(name)
    {
      bulletin_board: "#{VOTING_SCHEME[name.to_sym]}::BulletinBoard".constantize
    }
  end

  def self.results_message?(voting_scheme_name, type_subtype)
    from_name(voting_scheme_name)::RESULTS.include?(type_subtype)
  end
end
