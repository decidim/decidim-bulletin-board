# frozen_string_literal: true

module VotingScheme
  class Voter
    def initialize(election)
      @election = election
    end

    attr_reader :election
  end

  class RejectedMessage < StandardError
  end
end
