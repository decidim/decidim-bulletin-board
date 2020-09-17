# frozen_string_literal: true

module Types
  # QueryType = GraphQL::ObjectType.new.tap do |root_type|
  #   root_type.name = 'Query'
  #   root_type.description = 'The query root'
  #   root_type.interfaces = []
  # end

  class QueryType < Types::BaseObject
    # Add root-level fields here.
    # They will be entry points for queries on your schema.
    field :clients,
          [Types::ClientType],
          null: false,
          description: "Returns a list of clients in the bulletin board"

    def clients
      Client.all
    end
  end
end
