# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :create_election, mutation: Mutations::CreateElectionMutation
    field :process_key_ceremony_step, mutation: Mutations::ProcessKeyCeremonyStepMutation
    field :open_ballot_box, mutation: Mutations::OpenBallotBoxMutation
    field :vote, mutation: Mutations::VoteMutation
    field :close_ballot_box, mutation: Mutations::CloseBallotBoxMutation
    field :start_tally, mutation: Mutations::StartTallyMutation
    field :process_tally_step, mutation: Mutations::ProcessTallyStepMutation
    field :publish_results, mutation: Mutations::PublishResultsMutation
  end
end
