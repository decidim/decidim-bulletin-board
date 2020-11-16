# frozen_string_literal: true

module VotingScheme
  class Base
    def initialize(election)
      @election = election
      @state = restore(election.voting_scheme_state) if election.voting_scheme_state
    end

    attr_reader :election, :state

    def restore(data)
      Marshal.load(data) # rubocop:disable Security/MarshalLoad
    end

    def backup
      Marshal.dump(state)
    end

    def process_message(message); end
  end

  class RejectedMessage < StandardError
  end
end
