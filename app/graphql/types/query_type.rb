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

    # TODO: remove me
    field :test_field, String, null: false,
                               description: "An example field added by the generator"
    def test_field
      "Hello World!"
    end
  end
end
