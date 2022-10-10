# frozen_string_literal: true

if Rails.env.production? || ENV.fetch("SANDBOX", nil)
  Sidekiq.configure_server do |config|
    config.redis = { ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
  end

  Sidekiq.configure_client do |config|
    config.redis = { ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
  end
end
