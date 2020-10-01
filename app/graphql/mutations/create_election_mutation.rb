# frozen_string_literal: true

module Mutations
  class CreateElectionMutation < GraphQL::Schema::Mutation
    argument :signed_data, String, required: true
    argument :api_key, String, required: true

    field :election, Types::ElectionType, null: true
    field :error, String, null: true
    def resolve(signed_data:, api_key:)
      authority = get_authority(api_key)
      return { error: "Authority not found" } unless authority

      CreateElection.call(authority, signed_data) do
        on(:ok) do |election|
          return { election: election }
        end
        on(:invalid) do |error|
          return { error: error }
        end
      end
    end

    def get_authority(api_key)
      Authority.find_by(api_key: api_key)
    end
  end
end
