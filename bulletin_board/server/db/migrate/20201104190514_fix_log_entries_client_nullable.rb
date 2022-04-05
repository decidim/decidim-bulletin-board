# frozen_string_literal: true

class FixLogEntriesClientNullable < ActiveRecord::Migration[6.1]
  def change
    change_column_null :log_entries, :client_id, true
  end
end
