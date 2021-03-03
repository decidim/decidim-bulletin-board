# frozen_string_literal: true

module Decidim
  module BulletinBoard
    # Client to store GraphQL requests to a CSV file instead of sending them to the BulletinBoard
    # It is intended to be used for load testing
    class FileClient < Decidim::BulletinBoard::Client
      def initialize(file_path, config = Decidim::BulletinBoard)
        @settings = Settings.new(config)
        @graphql = Graphql::Factory.client_for_file(settings, file_path)
      end
    end
  end
end
