# frozen_string_literal: true

module VotingScheme
  module Dummy
    # A dummy implementation of a bulletin board adapter, only for tests purposes.
    # It uses a very basic math to perform simple but unsecure encryption operations,
    # similar to a real voting scheme implementation. It works like this:
    # - every Trustee chooses a random number as their public election key: Ki = rand(50, 249) * 2 + 1
    #  - these keys should be odd numbers between 100 and 500
    # - the joint key is the product of those keys: JK = K1 * K2 * ... * Kn
    # - voters encrypt each answer multiplying the joint election key by a random number and summing 0 or 1 to that: Aj = JK * rand(100, 500) + (0 | 1)
    # - when the tally begins, the BB creates the tally cast summing all the encrypted votes per answer: At = A1 + A2 + ... + Am
    # - each trustee calculates the modulus between each answer cast and their election public key and multiply the result by their election public key:
    #   Si = (At % Ki) * Ki
    # - the final decryption of each answer consists on multiplying all the shares for that answer, dividing it by the joint election key and then
    #   calculating the inverse power with the number of trustees: R = ((S1 * S2 * ... * Sn) / JK) ** (1/n)

    class BulletinBoard < VotingScheme::BulletinBoard
      include Dummy

      RESULTS = ["tally.share", "tally.compensation", "end_tally"].freeze

      private

      def emit_response(type_subtype, response = {})
        @response = {
          "message_type" => type_subtype,
          **response
        }
      end

      def append_content(content)
        @response["content"] = content.to_json
      end

      def process_create_election_message(_message_identifier, message, _content)
        raise RejectedMessage, "There must be at least 2 Trustees" if message.fetch(:trustees, []).count < 2
      end

      def process_start_key_ceremony_message(_message_identifier, _message, _content)
        @state = { joint_election_key: 1, trustees: [] }
      end

      def process_key_ceremony_message(message_identifier, _message, content)
        raise RejectedMessage, "The owner_id doesn't match the sender trustee" if content[:owner_id] != message_identifier.author_id
        raise RejectedMessage, "The trustee already sent their public key" if state[:trustees].include?(content[:owner_id])

        election_public_key = content.fetch(:election_public_key, 0)

        raise RejectedMessage, "The trustee public key should be odd" unless election_public_key.odd?
        raise RejectedMessage, "The trustee public key should be between 100 and 500" unless election_public_key.between?(100, 500)

        state[:trustees] << content[:owner_id]
        state[:joint_election_key] *= election_public_key

        if state[:trustees].count == election.trustees.count
          emit_response "end_key_ceremony"
          append_content joint_election_key: state[:joint_election_key]
        end
      end

      # rubocop:disable Metrics/CyclomaticComplexity
      def process_vote_message(_message_identifier, _message, content)
        raise RejectedMessage, "The given ballot style is invalid" if content.fetch(:ballot_style, "invalid-style") == "invalid-style"
        raise RejectedMessage, "Invalid ballot format" unless content[:contests]

        content[:contests].each do |contest|
          raise RejectedMessage, "Invalid ballot format" unless contest[:object_id] && contest[:ballot_selections]

          contest[:ballot_selections].each do |ballot_selection|
            raise RejectedMessage, "Invalid ballot format" unless ballot_selection[:object_id] && ballot_selection[:ciphertext]
            raise RejectedMessage, "The encrypted ballot is invalid" if ballot_selection[:ciphertext] % state[:joint_election_key] > 1
          end
        end
      end
      # rubocop:enable Metrics/CyclomaticComplexity

      def process_start_tally_message(_message_identifier, _message, _content)
        results = build_questions_struct(0)
        votes.each do |log_entry|
          vote = parse_content(log_entry.decoded_data)
          vote[:contests].each do |contest|
            contest[:ballot_selections].each do |ballot_selection|
              results[contest[:object_id]][ballot_selection[:object_id]] += ballot_selection[:ciphertext]
            end
          end
        end

        state[:compensations] = {}
        state[:joint_compensations] = {}
        state[:compensated] = 0
        state[:shares] = []
        state[:joint_shares] = build_questions_struct(1)

        emit_response "tally.cast"
        append_content results
      end

      def process_tally_message(message_identifier, message, content)
        if message_identifier.subtype == "missing_trustee"
          state[:compensations][message[:trustee_id]] = []
          state[:joint_compensations][message[:trustee_id]] = build_questions_struct(1)

          return
        end

        raise RejectedMessage, "The owner_id doesn't match the sender trustee" if content[:owner_id] != message_identifier.author_id

        case message_identifier.subtype
        when "share"
          process_tally_share_message content
        when "compensation"
          process_compensation_message content
        end

        return unless state[:shares].count + state[:compensated] == election.trustees.count

        results = build_questions_struct(0)
        state[:joint_shares].each do |question, answers|
          answers.each do |answer, joint_share|
            results[question][answer] = ((joint_share / state[:joint_election_key])**(1.0 / state[:trustees].count)).round
          end
        end

        emit_response "end_tally", results: results
      end

      def process_tally_share_message(content)
        raise RejectedMessage, "The trustee already sent their share" if state[:shares].include?(content[:owner_id])

        state[:shares] << content[:owner_id]

        content[:contests].each do |question, answers|
          answers.each do |answer, share|
            state[:joint_shares][question][answer] *= share
          end
        end
      end

      def process_compensation_message(content)
        compensation = state[:compensations][content[:trustee_id]]
        raise RejectedMessage, "The trustee already sent their compensation for #{content[:trustee_id]}" if compensation.include?(content[:owner_id])

        compensation << content[:owner_id]
        content[:contests].each do |question, answers|
          answers.each do |answer, value|
            state[:joint_compensations][content[:trustee_id]][question][answer] *= value
          end
        end

        return unless state[:compensations].count + state[:compensations][content[:trustee_id]].count == election.trustees.count

        state[:joint_compensations][content[:trustee_id]].each do |question, answers|
          answers.each do |answer, value|
            state[:joint_shares][question][answer] *= (value.round**(1.0 / state[:shares].count)).round
          end
        end
        state[:compensated] += 1
      end

      def build_questions_struct(initial_value)
        election.manifest[:description][:contests].map do |contest|
          [
            contest[:object_id],
            contest[:ballot_selections].map do |ballot_selection|
              [
                ballot_selection[:object_id],
                initial_value
              ]
            end.to_h
          ]
        end.to_h
      end
    end
  end
end
