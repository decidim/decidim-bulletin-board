# frozen_string_literal: true

module VotingSchemes
  class Test < Base
    def validate_election
      "There must be at least 2 Trustees" if election.manifest.fetch("trustees", []).count < 2
    end
  end
end
