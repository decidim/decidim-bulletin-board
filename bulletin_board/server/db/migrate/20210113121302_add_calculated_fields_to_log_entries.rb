# frozen_string_literal: true

class AddCalculatedFieldsToLogEntries < ActiveRecord::Migration[6.0]
  def change
    change_table :log_entries, bulk: true do |t|
      t.integer :iat, null: false, index: true
      t.string :author_unique_id, null: false
      t.string :message_type, null: false
    end
  end
end
