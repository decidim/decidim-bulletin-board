# frozen_string_literal: true

module VotingScheme
  class Voter
    def initialize(election, voter_id)
      @election = election
      @voter_id = voter_id
    end

    attr_reader :election, :voter_id

    def process_message(_message_type, _message)
      raise StandardError, "Not implemented"
    end

    def encrypt(_plaintext)
      raise StandardError, "Not implemented"
    end
  end

  class RejectedMessage < StandardError
  end
end
