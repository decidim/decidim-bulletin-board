# frozen_string_literal: true

require "voting_scheme/base"
require "voting_scheme/dummy"
require "voting_scheme/election_guard"

module VotingScheme
  VOTING_SCHEME = {
    dummy: Dummy,
    election_guard: ElectionGuard
  }.freeze

  def self.from_name(name)
    VOTING_SCHEME[name.to_sym]
  end
end
