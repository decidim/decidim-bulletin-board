# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :create_election, mutation: Mutations::CreateElectionMutation
    field :key_ceremony, mutation: Mutations::KeyCeremonyMutation
  end
end
