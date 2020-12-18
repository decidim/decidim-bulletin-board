# frozen_string_literal: true

require "decidim/bulletin_board/graphql/client"

module Decidim
  module BulletinBoard
    # The base class for all commands.
    class Command
      include Wisper::Publisher

      delegate :authority_slug, :private_key, to: :class

      def unique_election_id(election_id)
        Decidim::BulletinBoard::MessageIdentifier.unique_election_id(authority_slug, election_id)
      end

      def message_id(unique_election_id, type_subtype, voter_id = nil)
        Decidim::BulletinBoard::MessageIdentifier.format(unique_election_id, type_subtype, voter_id ? :voter : :authority, voter_id || authority_slug)
      end

      def sign_message(message_id, message)
        JWT.encode(complete_message(message_id, message), private_key.keypair, "RS256")
      end

      def client
        @client ||= BulletinBoard::Graphql::Client.client
      end

      def complete_message(message_id, message)
        message.merge({
                        iat: Time.now.to_i,
                        message_id: message_id
                      })
      end

      class << self
        def self.call(*args)
          new(*args).call
        end

        def private_key
          @private_key ||= JwkUtils.import_private_key(BulletinBoard.identification_private_key)
        end

        def authority_slug
          @authority_slug ||= BulletinBoard.authority_name.parameterize
        end
      end
    end
  end
end
