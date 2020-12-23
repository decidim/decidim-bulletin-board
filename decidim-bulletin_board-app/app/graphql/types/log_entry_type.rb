# frozen_string_literal: true

module Types
  class LogEntryType < Types::BaseObject
    field :id, ID, null: false
    field :election, Types::ElectionType, null: false
    field :client, Types::ClientType, null: false
    field :signed_data, String, null: false
    field :chained_hash, String, null: false
    field :content_hash, String, null: true
    field :message_id, String, null: false
  end
end
