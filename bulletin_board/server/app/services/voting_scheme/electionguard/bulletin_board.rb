# frozen_string_literal: true

require "pycall/dict"
require "pycall"
EGBB = PyCall.import_module("bulletin_board.electionguard.bulletin_board")

module VotingScheme
  module Electionguard
    # An implementation of the ElectionGuard bulletin board adapter, using PyCall to execute the ElectionGuard python code
    class BulletinBoard < VotingScheme::BulletinBoard
      include Electionguard

      RESULTS = ["tally.trustee_share", "end_tally"].freeze

      delegate :backup, to: :state

      def process_message(message_identifier, message)
        results = state.process_message(message_identifier.type_subtype, PyCall::Dict.new(message))
        results << tally_cast if message_identifier.type == "start_tally"

        results.map { |r| to_h(r) }
      end

      def restore(data)
        EGBB.BulletinBoard.restore(data)
      end

      private

      def state
        @state ||= EGBB.BulletinBoard.new
      end

      def tally_cast
        votes.each do |log_entry|
          state.add_ballot(log_entry.decoded_data[:content])
        end

        state.get_tally_cast
      end
    end
  end
end
