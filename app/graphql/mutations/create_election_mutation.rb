# frozen_string_literal: true

module Mutations
  class CreateElectionMutation < GraphQL::Schema::Mutation
    argument :signed_data, String, required: true

    field :election, Types::ElectionType, null: true
    field :error, String, null: true

    def resolve(signed_data:)
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

    def authority
      @authority ||= Authority.find_by(api_key: context[:api_key])
    end
  end
end
