# frozen_string_literal: true

namespace :schema do
  desc "Generate the schema introspection file in the bulletin board gem"
  task :generate, :environment do
    client = Graphlient::Client.new("http://localhost:8000/api", schema_path: "../decidim-bulletin_board-ruby/lib/decidim/bulletin_board/graphql/bb_schema.json")
    client.schema.dump!
  end
end
