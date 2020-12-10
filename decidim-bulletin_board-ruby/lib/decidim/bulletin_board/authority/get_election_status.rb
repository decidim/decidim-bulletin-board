# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Authority
      # This command uses the GraphQL client to get the status of the election.
      class GetElectionStatus
        include Wisper::Publisher
        # Public: Initializes the command.
        #
        # election - The election to receive the status from.
        def initialize(election_id)
          @election_id = election_id
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid and the query operation is successful.
        # - :error if query operation was not successful.
        #
        # Returns nothing.
        def call
          args = {
            unique_id: election_id
          }

          begin
            response = client.query do
              query do
                election(uniqueId: args[:unique_id]) do
                  status
                end
              end
            end

            broadcast(:ok, response.data.election.status)
          rescue Graphlient::Errors::ServerError
            broadcast(:error, "Sorry, something went wrong")
          end
        end

        private

        attr_reader :election_id

        def client
          @client ||= BulletinBoard::Graphql::Client.client
        end
      end
    end
  end
end
