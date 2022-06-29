# frozen_string_literal: true

class AddContentHashToLogEntries < ActiveRecord::Migration[6.1]
  def change
    add_column :log_entries, :content_hash, :string, null: true
    add_index :log_entries, :content_hash
  end
end
