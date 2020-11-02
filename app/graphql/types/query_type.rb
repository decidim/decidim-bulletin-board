# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :authorities,
          [Types::ClientType],
          null: false,
          description: "Returns a list of authorities in the bulletin board"

    def authorities
      Authority.all
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
