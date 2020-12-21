# frozen_string_literal: true

class ProcessKeyCeremonyStepJob < ApplicationJob
  queue_as :key_ceremony

  def perform(pending_message_id)
    pending_message = PendingMessage.find(pending_message_id)

    log_entries_to_notify = []
    pending_message.with_lock do
      next unless pending_message.enqueued?

      ProcessKeyCeremonyStep.call(pending_message.client, pending_message.message_id, pending_message.signed_data) do
        on(:ok) do |log_entries|
          log_entries_to_notify = log_entries
          pending_message.status = :accepted
        end
        on(:invalid) do |message|
          warn message
          pending_message.status = :rejected
        end
      end

      raise MessageNotProcessed unless pending_message.processed?

      pending_message.save!
    end

    log_entries_to_notify.each do |log_entry|
      LogEntryNotifier.new(log_entry).notify_subscribers
    end
  end
end
