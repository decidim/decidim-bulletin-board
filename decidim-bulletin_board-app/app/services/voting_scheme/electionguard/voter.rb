# frozen_string_literal: true

require "pycall/dict"
require "pycall"
EGV = PyCall.import_module("bulletin_board.electionguard.voter")

module VotingScheme
  module Electionguard
    # An implementation of the ElectionGuard voter adapter, using PyCall to execute the ElectionGuard python code
    class Voter < VotingScheme::Voter
    end
  end
end
