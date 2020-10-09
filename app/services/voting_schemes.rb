# frozen_string_literal: true

require "voting_schemes/base"
require "voting_schemes/test"

module VotingSchemes
  VOTING_SCHEMES = {
    test: Test
  }.freeze

  def self.from_name(name)
    VOTING_SCHEMES[name.to_sym]
  end
end
