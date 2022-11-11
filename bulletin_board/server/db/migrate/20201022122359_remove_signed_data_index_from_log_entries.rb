# frozen_string_literal: true

class RemoveSignedDataIndexFromLogEntries < ActiveRecord::Migration[6.1]
  def change
    remove_index :log_entries, :signed_data
  end
end
