# frozen_string_literal: true

require "decidim/bulletin_board/command"
require "decidim/bulletin_board/graphql/factory"
require "decidim/bulletin_board/settings"

require "decidim/bulletin_board/authority/create_election"
require "decidim/bulletin_board/authority/end_vote"
require "decidim/bulletin_board/authority/get_election_status"
require "decidim/bulletin_board/authority/start_key_ceremony"
require "decidim/bulletin_board/authority/start_tally"
require "decidim/bulletin_board/authority/start_vote"
require "decidim/bulletin_board/authority/publish_results"
require "decidim/bulletin_board/authority/get_election_results"
require "decidim/bulletin_board/voter/cast_vote"
require "decidim/bulletin_board/voter/get_pending_message_status"

module Decidim
  module BulletinBoard
    # The Bulletin Board client
    class Client
      def initialize(config = Decidim::BulletinBoard)
        @settings = Settings.new(config)
        @graphql = Graphql::Factory.client_for(settings)
      end

      delegate :configured?, :server, :public_key, :authority_name, :number_of_trustees, :quorum, to: :settings

      def create_election(election_id, election_data)
        create_election = configure Authority::CreateElection.new(election_id, election_data)
        yield create_election.message_id if block_given?
        create_election.on(:ok) { |election| return election }
        create_election.on(:error) { |error_message| raise StandardError, error_message }
        create_election.call
      end

      def start_key_ceremony(election_id)
        start_key_ceremony = configure Authority::StartKeyCeremony.new(election_id)
        yield start_key_ceremony.message_id if block_given?
        start_key_ceremony.on(:ok) { |pending_message| return pending_message }
        start_key_ceremony.on(:error) { |error_message| raise StandardError, error_message }
        start_key_ceremony.call
      end

      def start_vote(election_id)
        start_vote = configure Authority::StartVote.new(election_id)
        yield start_vote.message_id if block_given?
        start_vote.on(:ok) { |pending_message| return pending_message }
        start_vote.on(:error) { |error_message| raise StandardError, error_message }
        start_vote.call
      end

      def cast_vote(election_id, voter_id, encrypted_vote)
        cast_vote = configure Voter::CastVote.new(election_id, voter_id, encrypted_vote)
        yield cast_vote.message_id if block_given?
        cast_vote.on(:ok) { |pending_message| return pending_message }
        cast_vote.on(:error) { |error_message| raise StandardError, error_message }
        cast_vote.call
      end

      def get_pending_message_status(message_id)
        get_pending_message_status = configure Voter::GetPendingMessageStatus.new(message_id)
        get_pending_message_status.on(:ok) { |status| return status }
        get_pending_message_status.on(:error) { |error_message| raise StandardError, error_message }
        get_pending_message_status.call
      end

      def end_vote(election_id)
        end_vote = configure Authority::EndVote.new(election_id)
        yield end_vote.message_id if block_given?
        end_vote.on(:ok) { |pending_message| return pending_message }
        end_vote.on(:error) { |error_message| raise StandardError, error_message }
        end_vote.call
      end

      def get_election_status(election_id)
        get_election_status = configure Authority::GetElectionStatus.new(election_id)
        get_election_status.on(:ok) { |status| return status }
        get_election_status.on(:error) { |error_message| raise StandardError, error_message }
        get_election_status.call
      end

      def start_tally(election_id)
        start_tally = configure Authority::StartTally.new(election_id)
        yield start_tally.message_id if block_given?
        start_tally.on(:ok) { |pending_message| return pending_message }
        start_tally.on(:error) { |error_message| raise StandardError, error_message }
        start_tally.call
      end

      def get_election_results(election_id)
        get_log_entries = configure Authority::GetElectionResults.new(election_id)
        get_log_entries.on(:ok) { |result| return result }
        get_log_entries.on(:error) { |error_message| raise StandardError, error_message }
        get_log_entries.call
      end

      def publish_results(election_id)
        publish_results = configure Authority::PublishResults.new(election_id)
        yield publish_results.message_id if block_given?
        publish_results.on(:ok) { |status| return status }
        publish_results.on(:error) { |error_message| raise StandardError, error_message }
        publish_results.call
      end

      private

      attr_reader :settings, :graphql

      def configure(command)
        command.configure(settings, graphql)
        command
      end
    end
  end
end
