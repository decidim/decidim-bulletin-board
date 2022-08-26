# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Voter
      # This command uses the GraphQL client to cast the vote.
      class CastVote < Decidim::BulletinBoard::Command
        # Public: Initializes the command.
        #
        # election_id - The local election identifier
        # voter_id - The unique identifier of the voter
        # encrypted_vote - The content of the encrypted vote.
        def initialize(election_id, voter_id, encrypted_vote)
          @election_id = election_id
          @voter_id = voter_id
          @encrypted_vote = encrypted_vote
        end

        # Returns the message_id related to the operation
        def message_id
          @message_id ||= build_message_id(unique_election_id(election_id), "vote.cast", voter_id)
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid and the mutation operation is successful.
        # - :error if the form wasn't valid or the mutation operation was not successful.
        #
        # Returns nothing.
        def call
          # arguments used inside the graphql operation
          args = {
            message_id:,
            signed_data: sign_message(message_id, { content: encrypted_vote })
          }

          begin
            response = graphql.query do
              mutation do
                vote(messageId: args[:message_id], signedData: args[:signed_data]) do
                  pendingMessage do
                    messageId
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
