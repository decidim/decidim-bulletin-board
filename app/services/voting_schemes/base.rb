# frozen_string_literal: true

module VotingSchemes
  class Base
    attr_reader :election

    def initialize(election)
      @election = election
    end

    def validate_election
      raise StandardError, "Not implemented"
    end
  end
end
