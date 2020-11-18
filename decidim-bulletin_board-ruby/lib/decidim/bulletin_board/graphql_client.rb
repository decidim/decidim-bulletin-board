# frozen_string_literal: true

module Decidim
  module BulletinBoard
    # The Bulletin Board GraphQL Client
    class GraphqlClient
      def self.client
        @client ||= Graphlient::Client.new(BulletinBoard.server,
                                           headers: {
                                             'Authorization' => BulletinBoard.api_key
                                           })
      end
    end
  end
end
