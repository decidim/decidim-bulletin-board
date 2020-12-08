# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Voter
      # This command uses the GraphQL client to cast the vote.
      class CastVote
        include Wisper::Publisher
        # Public: Initializes the command.
        #
        # form - A form object with the params.
        def initialize(form)
          @form = form
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid and the mutation operation is successful.
        # - :error if the form wasn't valid or the mutation operation was not successful.
        #
        # Returns nothing.
        def call
          return broadcast(:error, form.errors.full_messages.join(". ")) unless form.valid?

          args = {
            message_id: form.message_id,
            signed_data: form.signed_data
          }

          begin
            response = client.query do
              mutation do
                vote(messageId: args[:message_id], signedData: args[:signed_data]) do
                  pendingMessage do
                    status
                  end
                  error
                end
              end
            end

            return broadcast(:error, response.data.vote.error) if response.data.vote.error.present?

            broadcast(:ok, response.data.vote.pending_message)
          rescue Graphlient::Errors::FaradayServerError => e
            broadcast(:error, "something went wrong")
          end
        end

        private

        attr_reader :form

        def client
          @client ||= BulletinBoard::Graphql::Client.client
        end
      end
    end
  end
end