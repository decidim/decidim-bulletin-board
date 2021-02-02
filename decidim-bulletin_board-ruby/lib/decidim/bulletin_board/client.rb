# frozen_string_literal: true

require "decidim/bulletin_board/command"

module Decidim
  module BulletinBoard
    # The Bulletin Board client
    class Client
      def initialize
        @server = BulletinBoard.server.presence
        @api_key = BulletinBoard.api_key.presence
        @scheme = BulletinBoard.scheme.presence
        @authority_name = BulletinBoard.authority_name.presence
        @number_of_trustees = BulletinBoard.number_of_trustees.presence
        @identification_private_key = BulletinBoard.identification_private_key.presence
        @private_key = identification_private_key_content if identification_private_key
      end

      attr_reader :server, :scheme, :api_key, :number_of_trustees, :authority_name

      delegate :authority_slug, to: Decidim::BulletinBoard::Command

      def quorum
        @scheme.dig(:parameters, :quorum) || number_of_trustees
      end

      def public_key
        private_key&.export
      end

      def configured?
        private_key && server && api_key
      end

      def create_election(election_id, election_data)
        create_election = Decidim::BulletinBoard::Authority::CreateElection.new(election_id, election_data)
        yield create_election.message_id if block_given?
        create_election.on(:ok) { |election| return election }
        create_election.on(:error) { |error_message| raise StandardError, error_message }
        create_election.call
      end

      def start_key_ceremony(election_id)
        start_key_ceremony = Decidim::BulletinBoard::Authority::StartKeyCeremony.new(election_id)
        yield start_key_ceremony.message_id if block_given?
        start_key_ceremony.on(:ok) { |pending_message| return pending_message }
        start_key_ceremony.on(:error) { |error_message| raise StandardError, error_message }
        start_key_ceremony.call
      end

      def start_vote(election_id)
        start_vote = Decidim::BulletinBoard::Authority::StartVote.new(election_id)
        yield start_vote.message_id if block_given?
        start_vote.on(:ok) { |pending_message| return pending_message }
        start_vote.on(:error) { |error_message| raise StandardError, error_message }
        start_vote.call
      end

      def cast_vote(election_id, voter_id, encrypted_vote)
        cast_vote = Decidim::BulletinBoard::Voter::CastVote.new(election_id, voter_id, encrypted_vote)
        yield cast_vote.message_id if block_given?
        cast_vote.on(:ok) { |pending_message| return pending_message }
        cast_vote.on(:error) { |error_message| raise StandardError, error_message }
        cast_vote.call
      end

      def get_pending_message_status(message_id)
        get_pending_message_status = Decidim::BulletinBoard::Voter::GetPendingMessageStatus.new(message_id)
        get_pending_message_status.on(:ok) { |status| return status }
        get_pending_message_status.on(:error) { |error_message| raise StandardError, error_message }
        get_pending_message_status.call
      end

      def end_vote(election_id)
        end_vote = Decidim::BulletinBoard::Authority::EndVote.new(election_id)
        yield end_vote.message_id if block_given?
        end_vote.on(:ok) { |pending_message| return pending_message }
        end_vote.on(:error) { |error_message| raise StandardError, error_message }
        end_vote.call
      end

      def get_election_status(election_id)
        get_election_status = Decidim::BulletinBoard::Authority::GetElectionStatus.new(election_id)
        get_election_status.on(:ok) { |status| return status }
        get_election_status.on(:error) { |error_message| raise StandardError, error_message }
        get_election_status.call
      end

      def start_tally(election_id)
        start_tally = Decidim::BulletinBoard::Authority::StartTally.new(election_id)
        yield start_tally.message_id if block_given?
        start_tally.on(:ok) { |pending_message| return pending_message }
        start_tally.on(:error) { |error_message| raise StandardError, error_message }
        start_tally.call
      end
      
      def get_election_log_entries_by_types(election_id, types)
        log_entries = Decidim::BulletinBoard::Authority::GetElectionLogEntriesByTypes.new(election_id, types)
        log_entries.on(:ok) { |log_entries| return log_entries }
        log_entries.on(:error) { |error_message| raise StandardError, error_message }
        log_entries.call
      end

      def publish_results(election_id)
        publish_results = Decidim::BulletinBoard::Authority::PublishResults.new(election_id)
        yield publish_results.message_id if block_given?
        publish_results.on(:ok) { |status| return status }
        publish_results.on(:error) { |error_message| raise StandardError, error_message }
        publish_results.call
      end

      private

      attr_reader :identification_private_key, :private_key

      def identification_private_key_content
        @identification_private_key_content ||= JwkUtils.import_private_key(identification_private_key)
      end
    end
  end
end
