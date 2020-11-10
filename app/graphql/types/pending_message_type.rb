# frozen_string_literal: true

module Types
  class PendingMessageType < Types::BaseObject
    field :id, ID, null: false
    field :election, Types::ElectionType, null: true
    field :client, Types::ClientType, null: false
    field :signed_data, String, null: false
    field :status, String, null: false
  end
end
