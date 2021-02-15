# frozen_string_literal: true

module Decidim
  module BulletinBoard
    # The Bulletin Board settings class
    class Settings
      def initialize(config)
        @bulletin_board_server = config.bulletin_board_server.presence
        @bulletin_board_public_key = config.bulletin_board_public_key.presence

        @authority_api_key = config.authority_api_key.presence
        @authority_name = config.authority_name.presence
        @authority_private_key = JwkUtils.import_private_key(config.authority_private_key) if config.authority_private_key.present?

        @scheme_name = config.scheme_name.presence
        @number_of_trustees = config.number_of_trustees.presence
        @quorum = config.quorum.presence || number_of_trustees
      end

      def configured?
        bulletin_board_server && bulletin_board_public_key && authority_api_key && authority_name && authority_private_key && scheme_name && number_of_trustees
      end

      attr_reader :bulletin_board_server, :bulletin_board_public_key,
                  :authority_private_key, :authority_api_key, :authority_name,
                  :scheme_name, :number_of_trustees, :quorum

      def bulletin_board_public_key_rsa
        @bulletin_board_public_key_rsa ||= JWT::JWK::RSA.import(bulletin_board_public_key).public_key
      end

      def authority_slug
        @authority_slug ||= authority_name.parameterize
      end

      def authority_public_key
        @authority_public_key ||= authority_private_key&.export
      end
    end
  end
end
