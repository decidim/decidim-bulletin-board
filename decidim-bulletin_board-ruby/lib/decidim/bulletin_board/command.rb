# frozen_string_literal: true

module Decidim
  module BulletinBoard
    # The base class for all commands.
    class Command
      include Wisper::Publisher

      attr_reader :settings, :graphql

      def configure(settings, graphql)
        @settings = settings
        @graphql = graphql
      end

      def sign_message(message_id, message)
        JWT.encode(complete_message(message_id, message), settings.private_key.keypair, "RS256")
      end

      def complete_message(message_id, message)
        message.merge({
                        iat: Time.now.to_i,
                        message_id: message_id
                      })
      end

      def build_message_id(unique_election_id, type_subtype, voter_id = nil)
        MessageIdentifier.format(unique_election_id, type_subtype, voter_id ? :voter : :authority, voter_id || settings.authority_slug)
      end

      def unique_election_id(election_id)
        MessageIdentifier.unique_election_id(settings.authority_slug, election_id)
      end
    end
  end
end
