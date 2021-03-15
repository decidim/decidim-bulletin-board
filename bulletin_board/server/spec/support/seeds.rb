# frozen_string_literal: true

require "test/private_keys"

RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.strategy = :truncation
    DatabaseCleaner.clean
    Rails.application.load_seed
  end
end
