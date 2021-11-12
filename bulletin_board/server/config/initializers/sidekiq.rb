# frozen_string_literal: true

if Rails.env.production? || ENV["SANDBOX"]
  redis_host = ENV["REDIS_HOST"] || "localhost"
  redis_port = ENV["REDIS_PORT"] || 6379

  Sidekiq.configure_server do |config|
    config.redis = {host: redis_host, port: redis_port, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
  end

  Sidekiq.configure_client do |config|
    config.redis = {host: redis_host, port: redis_port, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
  end
end
