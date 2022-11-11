# frozen_string_literal: true

module VotingScheme
  class BulletinBoard
    def initialize(election, votes = nil)
      @election = election
      @votes = votes
      @state = restore(election.voting_scheme_state) if election.voting_scheme_state
    end

    attr_reader :election, :state, :votes

    def restore(data)
      JSON.parse(data).symbolize_keys
    end

    def backup
      JSON.generate(state)
    end

    def self.results_message?(voting_scheme_name, type_subtype)
      VotingScheme.from_name(voting_scheme_name)[:bulletin_board]::RESULTS.include?(type_subtype)
    end
  end

  class RejectedMessage < StandardError
  end
end
