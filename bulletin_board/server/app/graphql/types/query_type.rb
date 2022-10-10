# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :me,
          Types::ClientType,
          null: false,
          description: "Returns the information for this bulletin board instance"

    def me
      BulletinBoard
    end

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

    field :election,
          Types::ElectionType,
          null: true,
          description: "Returns an election given its unique_id" do
      argument :unique_id, String, required: true
    end

    def election(unique_id:)
      Election.find_by(unique_id:)
    end

    field :pending_message,
          Types::PendingMessageType,
          null: true,
          description: "Returns the information for a given message" do
      argument :id, ID, required: false
      argument :message_id, String, required: false

      def resolve(_parent, args, _context)
        if args[:id]
          PendingMessage.find_by(id: args[:id])
        elsif args[:message_id]
          PendingMessage.order(created_at: :desc).find_by(message_id: args[:message_id])
        end
      end
    end

    field :log_entry,
          Types::LogEntryType,
          null: true,
          description: "Returns the log entry with the given content hash for the given election" do
      argument :election_unique_id, String, required: true
      argument :content_hash, String, required: true

      def resolve(_parent, args, _context)
        LogEntry.find_by(election: Election.find_by(unique_id: args[:election_unique_id]), content_hash: args[:content_hash])
      end
    end
  end
end
