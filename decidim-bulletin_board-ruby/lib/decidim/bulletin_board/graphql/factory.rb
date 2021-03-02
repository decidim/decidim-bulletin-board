# frozen_string_literal: true

require "decidim/bulletin_board/graphql/file_adapter"

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

        def self.client_for_file(settings, file_path)
          Graphlient::Client.new(file_path,
                                 schema_path: File.join(__dir__, "bb_schema.json"),
                                 http: FileAdapter,
                                 headers: {
                                   "Authorization" => settings.authority_api_key
                                 })
        end
      end
    end
  end
end
