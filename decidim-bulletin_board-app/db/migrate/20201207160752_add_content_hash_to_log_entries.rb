# frozen_string_literal: true

class LogEntry < ApplicationRecord; end

class AddContentHashToLogEntries < ActiveRecord::Migration[6.0]
  def change
    add_column :log_entries, :content_hash, :string, null: false, unique: true
  end
end
