# frozen_string_literal: true

class VoteJob < ApplicationJob
  queue_as :vote

  def perform(pending_message_id)
    pending_message = PendingMessage.find(pending_message_id)

    pending_message.with_lock do
      next unless pending_message.enqueued?

      Vote.call(pending_message.client, pending_message.message_id, pending_message.signed_data) do
        on(:ok) { |_result| pending_message.status = :accepted }
        on(:invalid) { |_result, _message| pending_message.status = :rejected }
      end

      raise MessageNotProcessed unless pending_message.processed?

      pending_message.save!
    end
  end
end
