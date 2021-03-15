# frozen_string_literal: true

module Types
  class LogEntryType < Types::BaseObject
    implements MessageInterface

    field :chained_hash, String, null: false
    field :content_hash, String, null: true
    field :decoded_data, GraphQL::Types::JSON, null: true do
      def resolve(parent, _args, context)
        log_entry = parent.object
        log_entry.decoded_data if log_entry.visible_for_all? || log_entry.election.authority.api_key == context[:api_key]
      end
    end
  end
end
