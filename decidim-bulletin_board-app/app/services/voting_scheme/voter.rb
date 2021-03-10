# frozen_string_literal: true

module VotingScheme
  class Voter
    def initialize(election)
      @election = election
    end

    attr_reader :election

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
