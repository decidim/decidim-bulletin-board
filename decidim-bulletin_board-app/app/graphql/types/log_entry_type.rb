# frozen_string_literal: true

module Types
  class LogEntryType < Types::BaseObject
    field :id, ID, null: false, method: :message_id
    field :election, Types::ElectionType, null: false
    field :client, Types::ClientType, null: false
    field :signed_data, String, null: false
    field :chained_hash, String, null: false
    field :log_type, String, null: false
  end
end
