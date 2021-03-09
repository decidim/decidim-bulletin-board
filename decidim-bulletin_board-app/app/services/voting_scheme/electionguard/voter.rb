# frozen_string_literal: true

require "pycall/dict"
require "pycall"
EGV = PyCall.import_module("bulletin_board.electionguard.voter")

module VotingScheme
  module Electionguard
    # An implementation of the ElectionGuard voter adapter, using PyCall to execute the ElectionGuard python code
    class Voter < VotingScheme::Voter
      def process_message(message_identifier, message)
        results = state.process_message(message_identifier.type, PyCall::Dict.new(message))

        results.map { |r| to_h(r) }
      end

      def encrypt(plaintext)
        ciphertext = state.encrypt(PyCall::Dict.new(plaintext))

        to_h(ciphertext)
      end

      private

      def state
        @state ||= EGV.Voter.new(SecureRandom.hex)
      end

      def to_h(dict)
        return dict unless dict.is_a?(PyCall::Dict)

        dict.inject({}) do |h, (k, v)|
          h.update(k => to_h(v))
        end
      end
    end
  end
end
