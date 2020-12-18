# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Voter
      # This command uses the GraphQL client to cast the vote.
      class CastVote < Decidim::BulletinBoard::Command

        # Public: Initializes the command.
        #
        # form - A form object with the params.
        def initialize(election_id, voter_id, encrypted_vote)
          @election_id = election_id
          @voter_id = voter_id
          @encrypted_vote = encrypted_vote
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid and the mutation operation is successful.
        # - :error if the form wasn't valid or the mutation operation was not successful.
        #
        # Returns nothing.
        def call
          message_id = message_id(unique_election_id(election_id), "vote.cast", voter_id)
          signed_data = sign_message(message_id, { content: encrypted_vote })

          begin
            response = client.query do
              mutation do
                vote(messageId: message_id, signedData: signed_data) do
                  pendingMessage do
                    status
                  end
                  error
                end
              end
            end

            return broadcast(:error, response.data.vote.error) if response.data.vote.error.present?

            broadcast(:ok, response.data.vote.pending_message)
          rescue Graphlient::Errors::FaradayServerError
            broadcast(:error, "something went wrong")
          end
        end

        private

        attr_reader :election_id, :voter_id, :encrypted_vote
      end
    end
  end
end
