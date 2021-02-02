# frozen_string_literal: true

# require "pycall/dict"
# require "pycall"
EGBB = 1 # PyCall.import_module("decidim.electionguard.bulletin_board")

module VotingScheme
  # An implementation of the ElectionGuard voting scheme, using PyCall to execute the ElectionGuard python code
  class ElectionGuard < Base
    RESULTS = ["tally.trustee_share", "end_tally"].freeze

    delegate :restore, :backup, to: :state

    def process_message(message_identifier, message)
      return tally_cast if message_identifier.type == "start_tally"

      state.process_message(message_identifier.subtype || message_identifier.type, PyCall::Dict.new(message))
    end

    private

    def state
      @state ||= EGBB.BulletinBoard.new
    end

    def tally_cast
      votes.each do |log_entry|
        state.add_ballot(PyCall::Dict.new(log_entry.decoded_data[:content]))
      end

      state.get_tally_cast
    end
  end
end
