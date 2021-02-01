# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Authority
      # This command uses the GraphQL client to start the tally process.
      class StartTally < Decidim::BulletinBoard::Command
        # Public: Initializes the command.
        #
        # election_id - The local election identifier
        def initialize(election_id)
          @election_id = election_id
        end

        # Returns the message_id related to the operation
        def message_id
          @message_id ||= message_id(unique_election_id(election_id), "start_tally")
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid and the query operation is successful.
        # - :error if query operation was not successful.
        #
        # Returns nothing.
        def call
          signed_data = sign_message(message_id, {})

          begin
            response = client.query do
              mutation do
                startTally(messageId: message_id, signedData: signed_data) do
                  pendingMessage do
                    status
                  end
                  error
                end
              end
            end

            return broadcast(:error, response.data.start_tally.error) if response.data.start_tally.error.present?

            broadcast(:ok, response.data.start_tally.pending_message)
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
