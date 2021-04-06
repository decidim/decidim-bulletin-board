# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Test
      # This command uses the GraphQL client to clear the database in test mode.
      class ResetTestDatabase < Decidim::BulletinBoard::Command
        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid and the mutation operation is successful.
        # - :error if query operation was not successful.
        #
        # Returns nothing.
        def call
          graphql.query do
            mutation do
              resetTestDatabase do
                timestamp
              end
            end
          end

          broadcast(:ok)
        rescue Graphlient::Errors::ServerError
          broadcast(:error, "Sorry, something went wrong")
        end
      end
    end
  end
end
