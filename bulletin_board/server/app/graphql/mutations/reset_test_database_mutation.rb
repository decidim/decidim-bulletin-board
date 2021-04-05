# frozen_string_literal: true

module Mutations
  class ResetTestDatabaseMutation < BaseMutation
    field :timestamp, Int, null: false

    def resolve
      raise GraphQL::ExecutionError, "not authorized" unless Rails.env.test?

      %x(`rake db:seed:replant`)

      {
        timestamp: Time.now.to_i
      }
    end
  end
end
