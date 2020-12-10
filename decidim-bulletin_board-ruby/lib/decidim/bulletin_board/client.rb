# frozen_string_literal: true

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

      def quorum
        return 0 if @scheme.dig(:parameters, :quorum).blank?

        @scheme.dig(:parameters, :quorum)
      end

      def authority_slug
        @authority_slug ||= authority_name.parameterize
      end

      def public_key
        private_key&.export
      end

      def configured?
        private_key && server && api_key
      end

      def sign_data(data)
        JWT.encode(data, identification_private_key.keypair, "RS256")
      end

      def setup_election(election_data)
        message_id = "#{election_data[:election_id]}.create_election+a.#{authority_slug}"
        Decidim::BulletinBoard::CreateElection.call(election_data, message_id)
      end

      def cast_vote(election_data, voter_data, encrypted_vote)
        form = Decidim::BulletinBoard::Voter::VoteForm.new(self, election_data, voter_data, encrypted_vote)
        cast_vote = Decidim::BulletinBoard::Voter::CastVote.new(form)
        cast_vote.on(:ok) { |pending_message| return pending_message }
        cast_vote.on(:error) { |error_message| raise StandardError, error_message }
        cast_vote.call
      end

      def get_status(election_id)
        unique_election_id = "#{authority_slug}.#{election_id}"
        get_status = Decidim::BulletinBoard::Authority::GetElectionStatus.new(unique_election_id)
        get_status.on(:ok) { |status| return status }
        get_status.on(:error) { |error_message| raise StandardError, error_message }
        get_status.call
      end

      private

      attr_reader :identification_private_key, :private_key

      def identification_private_key_content
        @identification_private_key_content ||= JwkUtils.import_private_key(identification_private_key)
      end
    end
  end
end
