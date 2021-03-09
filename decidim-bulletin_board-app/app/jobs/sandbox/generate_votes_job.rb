# frozen_string_literal: true

module Sandbox
  class GenerateVotesJob < ApplicationJob
    def perform(number_of_votes, election_id, file_path, client_settings = {})
      @election_id = election_id
      client = Decidim::BulletinBoard::FileClient.new(file_path, OpenStruct.new(client_settings))

      number_of_votes.times do
        client.cast_vote(election_id, SecureRandom.hex, random_encrypted_vote)
      end
    end

    attr_reader :election_id

    private

    def random_encrypted_vote
      {
        ballot_style: "ballot-style",
        contests: election.manifest[:description][:contests].map do |contest|
          current_selections = 0
          {
            object_id: contest[:object_id],
            ballot_selections: contest[:ballot_selections].map do |ballot_selection|
              answer = random_answer(current_selections > contest[:number_elected])
              current_selections += answer
              {
                object_id: ballot_selection[:object_id],
                ciphertext: answer + (rand * 500).floor * joint_election_key
              }
            end
          }
        end
      }.to_json
    end

    def random_answer(max_reached)
      max_reached ? 0 : rand(0..1)
    end

    def joint_election_key
      @joint_election_key ||= JSON.parse(election.log_entries.where(message_type: "end_key_ceremony").last.decoded_data["content"])["joint_election_key"]
    end

    def election
      @election ||= Election.find_by(id: election_id)
    end
  end
end
