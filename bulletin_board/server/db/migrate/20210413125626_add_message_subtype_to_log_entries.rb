# frozen_string_literal: true

class AddMessageSubtypeToLogEntries < ActiveRecord::Migration[6.0]
  def change
    add_column :log_entries, :message_subtype, :string

    add_index :log_entries, [:election_id, :message_type, :message_subtype, :author_unique_id], name: "index_log_entries_on_type_subtype_author"
  end
end
