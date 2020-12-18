# frozen_string_literal: true

require "bundler/setup"
require "decidim/bulletin_board"
require "byebug"
require "webmock/rspec"
require "wisper/rspec/matchers"

require "shared/client_context"

RSpec.configure do |config|
  config.color = true
  config.mock_with :rspec
  config.order = :random
  config.raise_errors_for_deprecations!
  # Enable flags like --only-failures and --next-failure
  config.example_status_persistence_file_path = ".rspec_status"
  config.include(Wisper::RSpec::BroadcastMatcher)

  config.filter_run_when_matching :focus
end
