# frozen_string_literal: true

module Sandbox
  class GenerateVotesJob < ApplicationJob
    def perform(number_of_votes, election_id, file_path, client_settings = {})
      @election_id = election_id
      voter_adapter = VotingScheme.from_election(election)[:voter].new(election)

      %w(create_election end_key_ceremony).each do |message_type|
        log_entry = log_entry_for(message_type)
        voter_adapter.process_message(log_entry.message_identifier, log_entry.decoded_data)
      end

      client = Decidim::BulletinBoard::FileClient.new(file_path, OpenStruct.new(client_settings))
      number_of_votes.times do
        encrypted_ballot = voter_adapter.encrypt(random_plaintext_ballot)
        client.cast_vote(election_id, SecureRandom.hex, encrypted_ballot)
      end
    end

    attr_reader :election_id

    private

    def random_plaintext_ballot
      election.manifest[:description][:contests].map do |contest|
        [
          contest[:object_id],
          contest[:ballot_selections].sample(Random.rand(contest[:number_elected] + 1))
                                     .map { |ballot_selection| ballot_selection[:object_id] }
        ]
      end.to_h
    end

    def election
      @election ||= Election.find_by(id: election_id)
    end

    def log_entry_for(message_type)
      election.log_entries.where(message_type: message_type).last
    end
  end
end
