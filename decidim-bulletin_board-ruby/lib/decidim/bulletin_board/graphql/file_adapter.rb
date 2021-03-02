# frozen_string_literal: true

module Decidim
  module BulletinBoard
    module Graphql
      class FileAdapter
        attr_reader :file_name

        def initialize(file_name, _options = {}, &_block)
          @file_name = file_name
        end

        def execute(document:, operation_name: nil, variables: {}, context: {})
          body = {}
          body["query"] = document.to_query_string
          body["variables"] = variables if variables.any?
          body["operationName"] = operation_name if operation_name

          File.open(file_name, "a+") do |f|
            f.puts "#{JSON.generate(body)};#{context[:headers]["Authorization"]}"
          end

          { "data" => { "vote" => {} } }
        end
      end
    end
  end
end
