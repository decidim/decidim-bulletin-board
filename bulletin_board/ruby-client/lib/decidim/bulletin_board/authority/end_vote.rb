# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Authority
      # This command uses the GraphQL client to request the ending of the voting period.
      class EndVote < Decidim::BulletinBoard::Command
        # Public: Initializes the command.
        #
        # election_id - The local election identifier
        def initialize(election_id)
          @election_id = election_id
        end

        # Returns the message_id related to the operation
        def message_id
          @message_id ||= build_message_id(unique_election_id(election_id), "end_vote")
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
            message_id: message_id,
            signed_data: sign_message(message_id, {})
          }

          response = graphql.query do
            mutation do
              endVote(messageId: args[:message_id], signedData: args[:signed_data]) do
                pendingMessage do
                  status
                end
                error
              end
            end
          end

          return broadcast(:error, response.data.end_vote.error) if response.data.end_vote.error.present?

          broadcast(:ok, response.data.end_vote.pending_message)
        rescue Graphlient::Errors::FaradayServerError
          broadcast(:error, "Sorry, something went wrong")
        end

        private

        attr_reader :election_id
      end
    end
  end
end
