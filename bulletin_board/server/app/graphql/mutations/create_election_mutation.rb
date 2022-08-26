# frozen_string_literal: true

module Mutations
  class CreateElectionMutation < BaseMutation
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
          result = { election: }
        end
        on(:invalid) do |error|
          result = { error: }
        end
      end

      result
    end
  end
end
