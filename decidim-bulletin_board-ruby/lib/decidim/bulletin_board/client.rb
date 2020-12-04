# frozen_string_literal: true

module Decidim
  module BulletinBoard
    # The Bulletin Board client
    class Client
      def initialize
        @server = BulletinBoard.server.presence
        @api_key = BulletinBoard.api_key.presence
        @scheme = BulletinBoard.scheme.presence
        @authority_name = BulletinBoard.authority_name.presence
        @number_of_trustees = BulletinBoard.number_of_trustees.presence
        @identification_private_key = BulletinBoard.identification_private_key.presence
        @private_key = identification_private_key_content if identification_private_key
      end

      attr_reader :server, :scheme, :api_key, :number_of_trustees, :authority_name

      def quorum
        return 0 if @scheme.dig(:parameters, :quorum).blank?

        @scheme.dig(:parameters, :quorum)
      end

      def authority_slug
        @authority_slug ||= authority_name.parameterize
      end

      def public_key
        private_key&.export
      end

      def configured?
        private_key && server && api_key
      end

      private

      attr_reader :identification_private_key, :private_key

      def identification_private_key_content
        @identification_private_key_content ||= JwkUtils.import_private_key(identification_private_key)
      end
    end
  end
end
