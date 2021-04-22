# frozen_string_literal: true

class DecidimBulletinBoardSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)
  use GraphQL::Guard.new(
    policy_object: Policies::VisibilityPolicy,
    not_authorized: ->(_type, _field) { nil }
  )
end
