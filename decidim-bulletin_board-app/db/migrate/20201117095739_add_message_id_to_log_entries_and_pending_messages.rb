# frozen_string_literal: true

class PendingMessage < ApplicationRecord; end

class AddMessageIdToLogEntriesAndPendingMessages < ActiveRecord::Migration[6.0]
  def change
    rename_column :log_entries, :log_type, :message_id
    add_column :pending_messages, :message_id, :string, null: true

    PendingMessage.all.each { |pending_message| pending_message.update_attribute(:message_id, "") } # rubocop:disable Rails/SkipsModelValidations

    change_column_null :pending_messages, :message_id, false
  end
end
