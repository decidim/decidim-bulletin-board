# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Authority
      # This command uses the GraphQL client to get the results of an election.
      class GetElectionResults < Decidim::BulletinBoard::Command
        # Public: Initializes the command.
        #
        # election_id [String] - The local election identifier
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
          # arguments used inside the graphql operation
          # unique_id [String] as election identifier
          # types [Array of Strings] to filter election log entries by their type
          args = {
            unique_id: unique_election_id(election_id),
            types: ["end_tally"]
          }

          response = graphql.query do
            query do
              election(uniqueId: args[:unique_id]) do
                logEntries(types: args[:types]) do
                  signedData
                end
              end
            end
          end

          return broadcast(:error, "There aren't any log entries with type: 'end_tally' for this election.") if response.data.election.log_entries.empty?

          @signed_data = response.data.election.log_entries.first.signed_data

          broadcast(:ok, decoded_data["results"])
        rescue Graphlient::Errors::ServerError
          broadcast(:error, "Sorry, something went wrong")
        end

        private

        attr_reader :election_id, :types, :signed_data

        def decoded_data
          @decoded_data ||= begin
            JWT.decode(signed_data, settings.server_public_key_rsa, true, algorithm: "RS256").first
          rescue JWT::VerificationError, JWT::DecodeError, JWT::InvalidIatError, JWT::InvalidPayload => e
            { error: e.message }
          end
        end
      end
    end
  end
end
