# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Graphql
      # The Bulletin Board GraphQL Client
      class Client
        def self.client
          @client ||= Graphlient::Client.new(BulletinBoard.server,
                                             headers: {
                                               "Authorization" => BulletinBoard.api_key
                                             })
        end
      end
    end
  end
end
