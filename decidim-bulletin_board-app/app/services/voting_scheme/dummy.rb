# frozen_string_literal: true

require "prime"

module VotingScheme
  # A dummy implementation of a voting scheme, only for tests purposes
  class Dummy < Base
    def process_message(message)
      method_name = :"process_#{message["type"]}_message"
      method(method_name).call(message) if respond_to?(method_name, true)
    end

    private

    def process_create_election_message(message)
      raise RejectedMessage, "There must be at least 2 Trustees" if message.fetch("trustees", []).count < 2

      @state = { joint_election_key: 1, trustees: [] }
      nil
    end

    def process_key_ceremony_message(message)
      election_public_key = message.fetch("election_public_key", 0)
      raise RejectedMessage, "The trustee already sent their public keys" if state[:trustees].include?(message["owner_id"])
      raise RejectedMessage, "The election public key should be a prime number" unless Prime.prime?(election_public_key)

      state[:trustees] << message["owner_id"]
      state[:joint_election_key] *= election_public_key

      if state[:trustees].count == election.trustees.count
        election.status = :ready
        {
          type: :joint_election_key,
          joint_election_key: state[:joint_election_key]
        }
      end
    end
  end
end
