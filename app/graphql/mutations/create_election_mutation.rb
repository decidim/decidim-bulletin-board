# frozen_string_literal: true

module Mutations
  class CreateElectionMutation < GraphQL::Schema::Mutation
    argument :title, String, required: true
    argument :signed_data, String, required: true

    field :outcome, String, null: true
    def resolve(title:, signed_data:)
      chained_hash = Digest::SHA256.hexdigest(signed_data)
      election_form = ElectionForm.new(title: title, status: "Published", authority: Authority.last,
                                       signed_data: signed_data,
                                       chained_hash: chained_hash, log_type: "createElection")

      if CreateElection.call(election_form)
        { outcome: "Success!" }
      else
        { outcome: "There has been an error" }
      end
    end
  end
end
