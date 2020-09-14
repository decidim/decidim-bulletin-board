# frozen_string_literal: true

module Types
  ClientType = GraphQL::ObjectType.define do
    name "ClientType"
    description "The client in the Bulletin Board"

    field :id, !types.ID
    field :name, !types.String
    field :public_key, !types.String
    field :type, !types.String
  end
end
