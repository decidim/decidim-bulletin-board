# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Authority
      # This class handles the creation of an election.
      class CreateElection < Decidim::BulletinBoard::Command
        def initialize(election_data)
          @election_data = election_data
        end

        def call
          message_id = message_id(election_data[:unique_id], "create_election")
          signed_data = sign_message(message_id, election_data)

          begin
            response = client.query do
              mutation do
                createElection(messageId: message_id, signedData: signed_data) do
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
        end

        private

        attr_reader :election_data
      end
    end
  end
end
