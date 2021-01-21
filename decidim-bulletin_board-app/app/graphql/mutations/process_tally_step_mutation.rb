# frozen_string_literal: true

module Mutations
  class ProcessTallyStepMutation < BaseMutation
    argument :message_id, String, required: true
    argument :signed_data, String, required: true

    field :pending_message, Types::PendingMessageType, null: true
    field :error, String, null: true

    def resolve(message_id:, signed_data:)
      client = find_client(message_id)

      return { error: "Client not found" } unless client

      result = { error: "There was an error adding the message to the pending list." }

      EnqueueMessage.call(client, message_id, signed_data, ProcessTallyStepJob) do
        on(:ok) do |pending_message|
          result = { pending_message: pending_message }
        end
      end

      result
    end
  end
end
