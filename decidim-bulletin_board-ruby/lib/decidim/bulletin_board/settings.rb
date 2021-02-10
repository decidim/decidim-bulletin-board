# frozen_string_literal: true

module Decidim
  module BulletinBoard
    # The Bulletin Board settings class
    class Settings
      def initialize(config)
        @server = config.server.presence
        @server_public_key = config.server_public_key.presence
        @api_key = config.api_key.presence

        @authority_name = config.authority_name.presence
        @identification_private_key = config.identification_private_key.presence

        @scheme_name = config.scheme_name.presence
        @number_of_trustees = config.number_of_trustees.presence
        @quorum = config.quorum.presence || number_of_trustees
      end

      attr_reader :server, :server_public_key, :api_key, :authority_name, :scheme_name, :number_of_trustees, :quorum

      def configured?
        server && server_public_key && api_key && authority_name && private_key && scheme_name && number_of_trustees
      end

      def authority_slug
        @authority_slug ||= authority_name.parameterize
      end

      def private_key
        return nil unless identification_private_key.present?

        @private_key ||= JwkUtils.import_private_key(identification_private_key)
      end

      def public_key
        @public_key ||= private_key&.export
      end

      def server_public_key_rsa
        @server_public_key_rsa ||= JWT::JWK::RSA.import(server_public_key).public_key
      end

      private

      attr_reader :identification_private_key
    end
  end
end
