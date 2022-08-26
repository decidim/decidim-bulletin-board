# frozen_string_literal: true

require "csv"

module Decidim
  module BulletinBoard
    module Graphql
      class FileAdapter
        attr_reader :file_name

        def initialize(file_name, _options = {}, &)
          @file_name = file_name
        end

        def execute(document:, operation_name: nil, variables: {}, context: {})
          body = {}
          body["query"] = document.to_query_string
          body["variables"] = variables if variables.any?
          body["operationName"] = operation_name if operation_name

          CSV.open(file_name, "a+", col_sep: ";") do |csv|
            csv << [JSON.generate(body), context[:headers]["Authorization"]]
          end

          { "data" => { "vote" => {} } }
        end
      end
    end
  end
end
