# frozen_string_literal: true

module Types
  class LogEntryType < Types::BaseObject
    implements MessageInterface

    field :chained_hash, String, null: false
    field :content_hash, String, null: true
    field :decoded_data, GraphQL::Types::JSON, null: false
  end
end
