# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Graphql
      # The Bulletin Board GraphQL Client
      class Client
        def self.client
          @client ||= Graphlient::Client.new(BulletinBoard.server,
                                             schema_path: File.join(__dir__, "bb_schema.json"),
                                             headers: {
                                               "Authorization" => BulletinBoard.api_key
                                             })
        end
      end
    end
  end
end
