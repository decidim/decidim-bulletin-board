# frozen_string_literal: true

require "prime"

module VotingScheme
  # A dummy implementation of a voting scheme, only for tests purposes
  class Dummy < Base
    def initial_state
      { joint_election_key: 1, trustees: [] }
    end

    def validate_election
      "There must be at least 2 Trustees" if election.manifest.fetch("trustees", []).count < 2
    end

    def process_message(message)
      method_name = :"process_#{message["type"]}_message"
      method(method_name).call(message) if respond_to?(method_name, true)
    end

    private

    def process_key_ceremony_message(message)
      election_public_key = message.fetch("election_public_key", 0)
      raise RejectedMessage unless Prime.prime?(election_public_key)

      owner_id = message.fetch("owner_id", nil)
      raise RejectedMessage if owner_id.nil? || state[:trustees].include?(owner_id)

      state[:trustees] << owner_id
      state[:joint_election_key] *= election_public_key

      if state[:trustees].length == election.trustees.count
        election.status = :ready
        {
          type: :joint_election_key,
          joint_election_key: state[:joint_election_key]
        }
      end
    end
  end
end
