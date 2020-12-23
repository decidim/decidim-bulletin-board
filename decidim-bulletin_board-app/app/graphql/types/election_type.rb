# frozen_string_literal: true

module Types
  class ElectionType < Types::BaseObject
    field :id, ID, null: false, method: :unique_id
    field :title, String, null: false
    field :status, String, null: false
    field :authority, Types::ClientType, null: false
    field :trustees, [Types::ClientType], null: false, description: "Returns the list of trustees for this election"

    field :log_entries, [Types::LogEntryType], null: false, description: "Returns the list of log entries for this election in the bulletin board" do
      argument :after, String, required: false

      def resolve(parent, args, _context)
        if args[:after]
          parent.object.log_entries.where("id > ?", args[:after].to_i)
        else
          parent.object.log_entries
        end
      end
    end
  end
end
