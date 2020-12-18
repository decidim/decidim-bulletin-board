# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Authority
      # This command uses the GraphQL client to get the status of the election.
      class GetElectionStatus < Decidim::BulletinBoard::Command
        # Public: Initializes the command.
        #
        # election_id - The local election identifier
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
          unique_id = unique_election_id(election_id)

          begin
            response = client.query do
              query do
                election(uniqueId: unique_id) do
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
      end
    end
  end
end
