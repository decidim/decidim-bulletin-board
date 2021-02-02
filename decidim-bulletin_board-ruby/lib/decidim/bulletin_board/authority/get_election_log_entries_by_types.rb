# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Authority
      # This command uses the GraphQL client to get the log entries of an election.
      class GetElectionLogEntriesByTypes < Decidim::BulletinBoard::Command
        # Public: Initializes the command.
        #
        # election_id [String] - The local election identifier
        # types [Array of Strings] - The message types you want to filter the log entries with
        def initialize(election_id, types)
          @election_id = election_id
          @types = types
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid and the query operation is successful.
        # - :error if query operation was not successful.
        #
        # Returns nothing.
        def call
          # arguments used inside the graphql operation
          args = {
            unique_id: unique_election_id(election_id),
            types: types
          }

          response = client.query do
            query do
              election(uniqueId: args[:unique_id]) do
                logEntries(types: args[:types]) do
                  signedData
                end
              end
            end
          end

          broadcast(:ok, response.data.election.log_entries)
        rescue Graphlient::Errors::ServerError
          broadcast(:error, "Sorry, something went wrong")
        end

        private

        attr_reader :election_id, :types
      end
    end
  end
end
