# frozen_string_literal: true

module Types
  class LogEntryType < Types::BaseObject
    field :id, ID, null: false
    field :election_id, String, null: false
    field :data, String, null: false
    field :data_hash, String, null: false
    field :log_type, String, null: false
  end
end
