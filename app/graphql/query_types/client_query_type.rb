# frozen_string_literal: true

module QueryTypes
  ClientQueryType = GraphQL::ObjectType.define do
    name "ClientQueryType"
    description "Client query type"

    field :clients, types[Types::ClientType], "returns all clients" do
      resolve ->(_obj, _args, _ctx) { Client.all }
    end
    field :client, Types::ClientType, "returns the queried client" do
      argument :id, !types[types.ID]

      resolve ->(_obj, args, _ctx) { Client.find_by!(id: args[:id]) }
    end
  end
end
