# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :create_election, mutation: Mutations::CreateElectionMutation
    field :end_vote, mutation: Mutations::EndVoteMutation
    field :process_key_ceremony_step, mutation: Mutations::ProcessKeyCeremonyStepMutation
    field :process_tally_step, mutation: Mutations::ProcessTallyStepMutation
    field :publish_results, mutation: Mutations::PublishResultsMutation
    field :report_missing_trustee, mutation: Mutations::ReportMissingTrusteeMutation
    field :reset_test_database, mutation: Mutations::ResetTestDatabaseMutation
    field :start_key_ceremony, mutation: Mutations::StartKeyCeremonyMutation
    field :start_tally, mutation: Mutations::StartTallyMutation
    field :start_vote, mutation: Mutations::StartVoteMutation
    field :vote, mutation: Mutations::VoteMutation
  end
end
