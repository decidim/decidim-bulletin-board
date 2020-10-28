# frozen_string_literal: true

module Types
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
    field :elections,
          [Types::ElectionType],
          null: false,
          description: "Returns a list of elections in the bulletin board"

    def elections
      Election.all
    end
  end
end
