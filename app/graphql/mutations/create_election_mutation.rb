# frozen_string_literal: true

module Mutations
  class CreateElectionMutation < GraphQL::Schema::Mutation
    argument :signed_data, String, required: true

    field :election, Types::ElectionType, null: true
    field :error, String, null: true
    def resolve(signed_data:)
      chained_hash = Digest::SHA256.hexdigest(signed_data)
      election_form = ElectionForm.new(title: [*("a".."z")].sample(8).join, status: "Published", authority: Authority.last,
                                       signed_data: signed_data,
                                       chained_hash: chained_hash, log_type: "createElection")

      CreateElection.call(election_form) do
        on(:ok) do |election|
          return { election: election }
        end
        on(:invalid) do |error|
          return { error: error }
        end
      end
    end
  end
end
