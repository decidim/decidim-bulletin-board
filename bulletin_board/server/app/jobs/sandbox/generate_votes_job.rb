# frozen_string_literal: true

require "redis"

module Sandbox
  class GenerateVotesJob < ApplicationJob
    include RedisProvider

    queue_as :vote

    def perform(number_of_votes, election_id, file_path, client_settings = {})
      @election_id = election_id
      @file_path = file_path
      @client_settings = client_settings

      remove_existing_file

      number_of_votes.times do
        # Creating a new Voter every time to simulate different voters
        voter_adapter = VotingScheme.from_election(election)[:voter].new(election, SecureRandom.hex)
        # Send to the adapter:
        # - the 'create_election' to provide the details of the election
        # - the 'end_key_ceremony' to provide the joint key
        %w(create_election end_key_ceremony).each do |message_type|
          log_entry = log_entry_for(message_type)
          voter_adapter.process_message(log_entry.message_identifier, log_entry.decoded_data)
        end
        encrypted_ballot = voter_adapter.encrypt(random_plaintext_ballot)
        client.cast_vote(election.unique_id.split(".").last, SecureRandom.hex, encrypted_ballot)
      end

      # Uploading the file to ActiveStorage and saving its URL in Redis (useful for when background jobs are executed on a different machine)
      file = File.open(file_path)
      blob = ActiveStorage::Blob.create_after_upload!(
        io: file,
        filename: "election-#{election.id}-votes-file.csv",
        content_type: "text/csv",
        identify: false
      )

      redis.set("election-#{election.id}-votes-file:signed_id", blob.signed_id)
      redis.set("election-#{election.id}-votes-file:time", Time.zone.now.to_s)
    end

    attr_reader :election_id, :file_path, :client_settings

    private

    def remove_existing_file
      File.delete(file_path) if File.exist?(file_path)
    end

    def random_plaintext_ballot
      election.manifest[:description][:contests].to_h do |contest|
        [
          contest[:object_id],
          contest[:ballot_selections].sample(Random.rand(contest[:number_elected] + 1))
                                     .map { |ballot_selection| ballot_selection[:object_id] }
        ]
      end
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
