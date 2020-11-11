# frozen_string_literal: true

class KeyCeremonyJob < ApplicationJob
  queue_as :key_ceremony

  def perform(pending_message_id)
    pending_message = PendingMessage.find(pending_message_id)

    pending_message.with_lock do
      next unless pending_message.enqueued?

      KeyCeremony.call(pending_message.client, pending_message.signed_data) do
        on(:election) { |election| pending_message.election = election }
        on(:processed) { |_result| pending_message.status = :processed }
        on(:invalid) do |_result, _message|
          pending_message.status = :rejected
        end
      end

      raise MessageNotProcessed unless processed?(pending_message)

      pending_message.save!
    end
  end

  private

  def processed?(pending_message)
    pending_message.election && !pending_message.enqueued?
  end
end

class MessageNotProcessed < StandardError; end
