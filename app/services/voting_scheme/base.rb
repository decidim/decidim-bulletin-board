# frozen_string_literal: true

module VotingScheme
  class Base
    attr_reader :election
    
    def initialize(election)
      @election = election
    end

    def validate_election; end
  end
end
