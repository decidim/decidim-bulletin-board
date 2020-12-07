# frozen_string_literal: true

module Decidim
  module BulletinBoard
    # This class handles the creation of an election.
    class CreateElection
      def initialize(election_data, message_id)
        @client = BulletinBoard::Graphql::Client.client
        @election_data = election_data
        @message_id = message_id
        @private_key = private_key
      end

      def self.call(election_data, message_id)
        new(election_data, message_id).call
      end

      def call
        args = {
          message_id: message_id,
          signed_data: encode_data(election_data)
        }

        response = client.query do
          mutation do
            createElection(messageId: args[:message_id], signedData: args[:signed_data]) do
              election do
                status
              end
              error
            end
          end
        end

        response.data.create_election
      end

      private

      attr_reader :client, :election_data, :message_id

      def private_key
        @private_key ||= JwkUtils.import_private_key(BulletinBoard.identification_private_key)
      end

      def encode_data(election_data)
        JWT.encode(election_data, private_key.keypair, "RS256")
      end
    end
  end
end
