# frozen_string_literal: true

require "prime"

module VotingScheme
  # A dummy implementation of a voting scheme, only for tests purposes
  class Dummy < Base
    def process_message(message_identifier, message)
      method_name = :"process_#{message_identifier.type}_message"
      content = parse_content(message)
      if respond_to?(method_name, true)
        @response = nil
        method(method_name).call(message_identifier, message, content)
        @response
      end
    end

    private

    def parse_content(message)
      JSON.parse(message.delete(:content) || "null")&.with_indifferent_access
    end

    def emit_response(type_subtype, response = {})
      @response = {
        "message_id" => "#{election.unique_id}.#{type_subtype}+b.#{BulletinBoard.unique_id}",
        "iat" => Time.now.to_i,
        **response
      }
    end

    def append_content(content)
      @response["content"] = content.to_json
    end

    def process_create_election_message(_message_identifier, message, _content)
      raise RejectedMessage, "There must be at least 2 Trustees" if message.fetch(:trustees, []).count < 2

      @state = { joint_election_key: 1, trustees: [] }
    end

    def process_key_ceremony_message(message_identifier, _message, content)
      raise RejectedMessage, "The owner_id doesn't match the sender trustee" if content[:owner_id] != message_identifier.author_id
      raise RejectedMessage, "The trustee already sent their public key" if state[:trustees].include?(content[:owner_id])

      election_public_key = content.fetch(:election_public_key, 0)
      state[:trustees] << content[:owner_id]
      state[:joint_election_key] *= election_public_key

      if state[:trustees].count == election.trustees.count
        election.status = :ready

        emit_response "key_ceremony.joint_election_key"
        append_content joint_election_key: state[:joint_election_key]
      end
    end

    def process_vote_message(_message_identifier, _message, content)
      raise RejectedMessage, "The given ballot style is invalid" if content.fetch(:ballot_style, "invalid-style") == "invalid-style"
    end

    def process_tally_message(message_identifier, _message, content)
      if message_identifier.subtype == "start"
        results = Hash.new { |h, k| h[k] = [] }
        votes.each do |log_entry|
          vote = parse_content(log_entry.decoded_data)
          vote.each do |question, answers|
            results[question] << answers
          end
        end

        state[:shares] = []

        emit_response "tally.cast"
        append_content results
      elsif message_identifier.subtype == "share"
        raise RejectedMessage, "The owner_id doesn't match the sender trustee" if content[:owner_id] != message_identifier.author_id
        raise RejectedMessage, "The trustee already sent their share" if state[:shares].include?(content[:owner_id])

        state[:shares] << content[:owner_id]
        if state[:shares].count == election.trustees.count
          results = Hash.new { |h, k| h[k] = [] }
          votes.each do |log_entry|
            vote = parse_content(log_entry.decoded_data)
            vote.each do |question, answers|
              results[question] << answers
            end
          end

          election.status = :results

          emit_response "tally.results", results: results
        end
      end
    end
  end
end
