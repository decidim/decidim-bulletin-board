# frozen_string_literal: true

module Decidim
  module BulletinBoard
    # This class handles the creation of an election.
    class CreateElection
      def initialize(election_data)
        @client = BulletinBoard::Graphql::Client.client
        @election_data = election_data
        @private_key = private_key
      end

      def self.call(election_data)
        new(election_data).call
      end

      def call
        signed_data = encode_data(@election_data)

        response = @client.query do
          mutation do
            createElection(signedData: signed_data) do
              election do
                id
                status
                title
                authority
              end
              error
            end
          end
        end

        response.data.create_election
      end

      private

      def private_key
        @private_key ||= JwkUtils.import_private_key(BulletinBoard.identification_private_key)
      end

      def encode_data(election_data)
        JWT.encode(election_data, private_key.keypair, "RS256")
      end
    end
  end
end
