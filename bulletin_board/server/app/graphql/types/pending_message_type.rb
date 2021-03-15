# frozen_string_literal: true

module Types
  class PendingMessageType < Types::BaseObject
    implements MessageInterface

    field :status, String, null: false
  end
end
