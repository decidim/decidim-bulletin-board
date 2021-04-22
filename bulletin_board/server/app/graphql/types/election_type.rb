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

    field :verifiable_results_hash, String, null: true
    field :verifiable_results_url, String, null: true do
      def resolve(parent, _args, _context)
        return if parent.object.verifiable_results.blank?

        Rails.application.routes.url_helpers.rails_blob_path(parent.object.verifiable_results, only_path: true)
      end
    end
  end
end
