# frozen_string_literal: true

class FixLogEntriesChainedHashType < ActiveRecord::Migration[6.0]
  def up
    change_column :log_entries, :chained_hash, :string
  end

  def down
    change_column :log_entries, :chained_hash, :text
  end
end
