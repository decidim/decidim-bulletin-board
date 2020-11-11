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

    field :pending_message,
          Types::PendingMessageType,
          null: true,
          description: "Returns the information for a given message" do

      argument :id, ID, required: true

      def resolve(_parent, args, _context)
        PendingMessage.find(args[:id])
      end
    end
  end
end
