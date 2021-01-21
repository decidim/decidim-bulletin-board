# frozen_string_literal: true

module Mutations
  class PublishResultsMutation < BaseMutation
    argument :message_id, String, required: true
    argument :signed_data, String, required: true

    field :election, Types::ElectionType, null: true
    field :error, String, null: true

    def resolve(message_id:, signed_data:)
      authority = find_authority(message_id)

      return { error: "Authority not found" } unless authority

      result = { error: "There was an error publishing the election's results." }

      PublishResults.call(authority, message_id, signed_data) do
        on(:ok) do |election|
          result = { election: election }
        end
        on(:invalid) do |error|
          result = { error: error }
        end
      end

      result
    end
  end
end
