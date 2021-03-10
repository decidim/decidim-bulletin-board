# frozen_string_literal: true

module Sandbox
  class GenerateVotesJob < ApplicationJob
    def perform(number_of_votes, election_id, file_path, client_settings = {})
      @election_id = election_id
      @file_path = file_path
      @client_settings = client_settings

      # Send to the adapter:
      # - the 'create_election' to provide the details of the election
      # - the 'end_key_ceremony' to provide the joint key
      %w(create_election end_key_ceremony).each do |message_type|
        log_entry = log_entry_for(message_type)
        voter_adapter.process_message(log_entry.message_identifier, log_entry.decoded_data)
      end
      number_of_votes.times do
        # We encrypt all the votes with the same voter adapter
        # since having votes from different voters is not crucial for the load tests
        encrypted_ballot = voter_adapter.encrypt(random_plaintext_ballot)
        client.cast_vote(election.unique_id.split(".").last, SecureRandom.hex, encrypted_ballot)
      end
    end

    attr_reader :election_id, :file_path, :client_settings

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

    def voter_adapter
      @voter_adapter ||= VotingScheme.from_election(election)[:voter].new(election, SecureRandom.hex)
    end

    def election
      @election ||= Election.find_by(id: election_id)
    end

    def client
      @client ||= Decidim::BulletinBoard::FileClient.new(file_path, OpenStruct.new(client_settings))
    end

    def log_entry_for(message_type)
      election.log_entries.where(message_type: message_type).last
    end
  end
end
