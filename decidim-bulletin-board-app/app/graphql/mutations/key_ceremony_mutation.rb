# frozen_string_literal: true

module Mutations
  class ProcessKeyCeremonyStepMutation < GraphQL::Schema::Mutation
    argument :signed_data, String, required: true

    field :pending_message, Types::PendingMessageType, null: true
    field :error, String, null: true

    def resolve(signed_data:)
      return { error: "Trustee not found" } unless trustee

      result = { error: "There was an error adding the message to the pending list." }

      EnqueueMessage.call(trustee, signed_data, ProcessKeyCeremonyStepJob) do
        on(:ok) do |pending_message|
          result = { pending_message: pending_message }
        end
      end

      result
    end

    def trustee
      @trustee ||= Trustee.find_by(unique_id: context[:token])
    end
  end
end
