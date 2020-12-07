# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :create_election, mutation: Mutations::CreateElectionMutation
    field :process_key_ceremony_step, mutation: Mutations::ProcessKeyCeremonyStepMutation
    field :vote, mutation: Mutations::VoteMutation
  end
end
