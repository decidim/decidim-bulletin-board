# frozen_string_literal: true

module Types
  class ElectionType < Types::BaseObject
    field :id, ID, null: false, method: :unique_id
    field :title, String, null: false
    field :status, String, null: false
    field :authority, Types::ClientType, null: false
    field :log_entries, [Types::LogEntryType], null: false, description: "Returns the list of log entries for this election in the bulletin board"
    field :trustees, [Types::ClientType], null: false, description: "Returns the list of trustees for this election"
  end
end
