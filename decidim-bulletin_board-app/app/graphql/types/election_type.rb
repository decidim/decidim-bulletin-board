# frozen_string_literal: true

module Types
  class ElectionType < Types::BaseObject
    field :id, ID, null: false, method: :unique_id
    field :title, GraphQL::Types::JSON, null: false
    field :status, String, null: false
    field :authority, Types::ClientType, null: false
    field :trustees, [Types::ClientType], null: false, description: "Returns the list of trustees for this election"

    field :log_entries, [Types::LogEntryType], null: false, description: "Returns the list of log entries for this election in the bulletin board" do
      argument :after, String, required: false
      argument :types, [String], required: false

      def resolve(parent, args, _context)
        log_entries = parent.object.log_entries
        log_entries = log_entries.where(message_type: args[:types]) if args[:types]
        log_entries = log_entries.where("id > ?", args[:after].to_i) if args[:after]
        log_entries
      end
    end
  end
end
