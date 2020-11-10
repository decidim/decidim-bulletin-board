# frozen_string_literal: true

require "voting_scheme/base"
require "voting_scheme/dummy"

module VotingScheme
  VOTING_SCHEME = {
    dummy: Dummy
  }.freeze

  def self.from_name(name)
    VOTING_SCHEME[name.to_sym]
  end
end
