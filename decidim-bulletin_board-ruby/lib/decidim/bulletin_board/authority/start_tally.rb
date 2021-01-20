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

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid and the query operation is successful.
        # - :error if query operation was not successful.
        #
        # Returns nothing.
        def call
          message_id = message_id(unique_election_id(election_id), "tally.start")
          signed_data = sign_message(message_id, {})

          begin
            response = client.query do
              mutation do
                processTallyStep(messageId: message_id, signedData: signed_data) do
                  pendingMessage do
                    status
                  end
                  error
                end
              end
            end

            return broadcast(:error, response.data.process_tally_step.error) if response.data.process_tally_step.error.present?

            broadcast(:ok, response.data.process_tally_step.pending_message)
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
