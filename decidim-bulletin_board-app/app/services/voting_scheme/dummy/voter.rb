# frozen_string_literal: true

module VotingScheme
  module Dummy
    # A dummy implementation of a voter adapter, only for tests purposes.
    # It uses a very basic math to perform simple but unsecure encryption operations,
    # similar to a real voting scheme implementation. 

    class Voter < VotingScheme::Voter
      def process_message(message_identifier, message)
        method_name = :"process_#{message_identifier.type}_message"
        content = parse_content(message)
        return [] unless respond_to?(method_name, true)

        @response = nil
        method(method_name).call(message_identifier, message, content)
        if @response
          [@response]
        else
          []
        end
      end

      def encrypt(vote)
        {
          ballot_style: "ballot-style",
          contests: election.manifest[:description][:contests].map do |contest|
            {
              object_id: contest[:object_id],
              ballot_selections: contest[:ballot_selections].map do |ballot_selection|
                plaintext = vote[contest[:object_id]].present? && vote[contest[:object_id]].include?(ballot_selection[:object_id]) ? 1 : 0
                {
                  object_id: ballot_selection[:object_id],
                  ciphertext: plaintext + (rand * 500).floor * joint_election_key
                }
              end
            }
          end
        }
      end

      private

      def parse_content(message)
        JSON.parse(message.delete(:content) || "null")&.with_indifferent_access
      end

      def process_create_election_message(_message_identifier, message, _content); end

      def process_end_key_ceremony_message(_message_identifier, _message, content)
        @joint_election_key = content["joint_election_key"]
      end

      attr_accessor :joint_election_key
    end
  end
end
