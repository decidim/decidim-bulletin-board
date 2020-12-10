# frozen_string_literal: true

require "prime"

module VotingScheme
  # A dummy implementation of a voting scheme, only for tests purposes
  class Dummy < Base
    def process_message(message_identifier, message)
      method_name = :"process_#{message_identifier.type}_message"
      content = JSON.parse(message.delete(:content) || "null")&.with_indifferent_access
      if respond_to?(method_name, true)
        @response = nil
        method(method_name).call(message, content)
        @response
      end
    end

    private

    def emit_response(response)
      @response = response
    end

    def process_create_election_message(message, content)
      raise RejectedMessage, "There must be at least 2 Trustees" if message.fetch(:trustees, []).count < 2

      @state = { joint_election_key: 1, trustees: [] }
    end

    def process_key_ceremony_message(message, content)
      election_public_key = content.fetch(:election_public_key, 0)
      raise RejectedMessage, "The trustee sent their public keys already" if state[:trustees].include?(content[:owner_id])
      raise RejectedMessage, "The election public key should be a prime number" unless Prime.prime?(election_public_key)

      state[:trustees] << content[:owner_id]
      state[:joint_election_key] *= election_public_key

      if state[:trustees].count == election.trustees.count
        election.status = :ready
        emit_response "message_id" => "#{election.unique_id}.key_ceremony.joint_election_key+b.#{BulletinBoard.unique_id}",
                      "joint_election_key" => state[:joint_election_key]
      end
    end

    def process_vote_message(message, content)
      raise RejectedMessage, "The given ballot style is invalid" if content.fetch(:ballot_style, "invalid-style") == "invalid-style"
    end
  end
end
