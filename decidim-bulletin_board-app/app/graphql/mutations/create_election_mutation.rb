# frozen_string_literal: true

require "message_identifier"

module Mutations
  class CreateElectionMutation < GraphQL::Schema::Mutation
    argument :message_id, String, required: true
    argument :signed_data, String, required: true

    field :election, Types::ElectionType, null: true
    field :error, String, null: true

    def resolve(message_id:, signed_data:)
      authority = find_authority(message_id)

      return { error: "Authority not found" } unless authority

      result = { error: "There was an error creating the election." }

      CreateElection.call(authority, message_id, signed_data) do
        on(:ok) do |election|
          result = { election: election }
        end
        on(:invalid) do |error|
          result = { error: error }
        end
      end

      result
    end

    private

    def find_authority(message_id)
      message_identifier = MessageIdentifier.new(message_id)
      message_identifier.from_authority? && Authority.find_by(unique_id: message_identifier.author_id, api_key: context[:token])
    end
  end
end
