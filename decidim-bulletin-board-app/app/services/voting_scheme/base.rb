# frozen_string_literal: true

module VotingScheme
  class Base
    def initialize(election)
      @election = election
      @state = if election.voting_scheme_state
                 load
               else
                 initial_state
               end
    end

    attr_reader :election, :state

    def load
      @state = Marshal.load(election.voting_scheme_state) # rubocop:disable Security/MarshalLoad
    end

    def save
      election.voting_scheme_state = Marshal.dump(state)
    end

    def initial_state; end

    def validate_election; end

    def process_message(message); end
  end

  class RejectedMessage < StandardError
  end
end
