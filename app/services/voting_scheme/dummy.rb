# frozen_string_literal: true

module VotingScheme
  # A dummy implementation of a voting scheme, only for tests purposes
  class Dummy < Base
    def validate_election
      "There must be at least 2 Trustees" if election.manifest.fetch("trustees", []).count < 2
    end
  end
end
