# frozen_string_literal: true

require "pycall/dict"
require "pycall"
EGBB = PyCall.import_module("decidim.electionguard.bulletin_board")

module VotingScheme
  # An implementation of the ElectionGuard voting scheme, using PyCall to execute the ElectionGuard python code
  class ElectionGuard < Base
    delegate :restore, :backup, to: :state

    def process_message(message_id, message)
      state.process_message(message_id.subtype || message_id.type, PyCall::Dict.new(message))
    end

    private

    def state
      @state ||= EGBB.BulletinBoard.new
    end
  end
end
