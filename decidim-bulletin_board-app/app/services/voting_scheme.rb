# frozen_string_literal: true

require "voting_scheme/bulletin_board"
require "voting_scheme/dummy/bulletin_board"
require "voting_scheme/electionguard/bulletin_board"
require "voting_scheme/voter"
require "voting_scheme/dummy/voter"
require "voting_scheme/electionguard/voter"

module VotingScheme
  VOTING_SCHEME = {
    dummy: Dummy,
    electionguard: Electionguard
  }.freeze

  def self.from_name(name)
    {
      bulletin_board: bulletin_board_adapter(name),
      voter: voter_adapter(name)
    }
  end

  def self.from_election(election)
    from_name(election.voting_scheme_name)
  end

  def self.bulletin_board_adapter(scheme_name)
    "#{VOTING_SCHEME[scheme_name.to_sym]}::BulletinBoard".constantize if VOTING_SCHEME[scheme_name.to_sym].present?
  end

  def self.voter_adapter(scheme_name)
    "#{VOTING_SCHEME[scheme_name.to_sym]}::Voter".constantize if VOTING_SCHEME[scheme_name.to_sym].present?
  end
end
