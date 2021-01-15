# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Voter
      # This command uses the GraphQL client to get the status of a specific pending message.
      class GetPendingMessageStatus < Decidim::BulletinBoard::Command
        # Public: Initializes the command.
        #
        # form - A form object with the params.
        def initialize(message_id)
          @message_id = message_id
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid and the query operation is successful.
        # - :error if the form wasn't valid or the query operation was not successful.
        #
        # Returns nothing.
        def call
          message_id = @message_id

          begin
            response = client.query do
              query do
                pendingMessage(messageId: message_id) do
                  status
                end
              end
            end

            broadcast(:ok, response.data.pending_message.status)
          rescue Graphlient::Errors::ServerError
            broadcast(:error, "Sorry, something went wrong")
          end
        end
      end
    end
  end
end
