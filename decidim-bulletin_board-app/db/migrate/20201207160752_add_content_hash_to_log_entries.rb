# frozen_string_literal: true

class AddContentHashToLogEntries < ActiveRecord::Migration[6.0]
  def change
    add_column :log_entries, :content_hash, :string, null: true, index: true
  end
end
