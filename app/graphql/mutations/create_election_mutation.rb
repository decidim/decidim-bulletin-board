# frozen_string_literal: true

module Mutations
  class CreateElectionMutation < GraphQL::Schema::Mutation
    argument :title, String, required: true
    argument :data, String, required: true

    field :outcome, String, null: true
    def resolve(title:, data:)
      data_hash = Digest::SHA256.hexdigest(data)
      election_form = ElectionForm.new(title: title, status: "Published", authority: Authority.last,
                                       data: data,
                                       data_hash: data_hash, log_type: "createElection")

      if CreateElection.call(election_form)
        { outcome: "Success!" }
      else
        { outcome: "There has been an error" }
      end
    end
  end
end
