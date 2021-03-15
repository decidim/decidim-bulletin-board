# frozen_string_literal: true

class DecidimBulletinBoardSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)
end
