# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Authority
      # This class handles the creation of an election.
      class CreateElection < Decidim::BulletinBoard::Command
        def initialize(election_id, election_data)
          @election_id = election_id
          @election_data = election_data
        end

        # Returns the message_id related to the operation
        def message_id
          @message_id ||= build_message_id(unique_election_id(election_id), "create_election")
        end

        def call
          # arguments used inside the graphql operation
          args = {
            message_id: message_id,
            signed_data: sign_message(message_id, election_data)
          }

          response = client.query do
            mutation do
              createElection(messageId: args[:message_id], signedData: args[:signed_data]) do
                election do
                  status
                end
                error
              end
            end
          end

          return broadcast(:error, response.data.create_election.error) if response.data.create_election.error.present?

          broadcast(:ok, response.data.create_election.election)
        rescue Graphlient::Errors::ServerError
          broadcast(:error, "Sorry, something went wrong")
        end

        private

        attr_reader :election_data, :election_id
      end
    end
  end
end
