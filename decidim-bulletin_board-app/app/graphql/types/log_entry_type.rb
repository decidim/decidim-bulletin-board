# frozen_string_literal: true

module Types
  class LogEntryType < Types::BaseObject
    implements MessageInterface

    field :chained_hash, String, null: false
    field :content_hash, String, null: true
  end
end
