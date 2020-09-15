# frozen_string_literal: true

module Types
  class ClientType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :public_key, String, null: true
    field :type, String, null: true
  end
end
