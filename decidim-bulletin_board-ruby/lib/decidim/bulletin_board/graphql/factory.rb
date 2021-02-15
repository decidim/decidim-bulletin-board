# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Graphql
      class Factory
        # The Bulletin Board GraphQL client factory
        def self.client_for(settings)
          Graphlient::Client.new(settings.bulletin_board_server,
                                 schema_path: File.join(__dir__, "bb_schema.json"),
                                 headers: {
                                   "Authorization" => settings.authority_api_key
                                 })
        end
      end
    end
  end
end
