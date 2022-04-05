# frozen_string_literal: true

module RedisProvider
  private

  def redis
    @redis ||=
      if !Rails.env.production? || ENV["SANDBOX"]
        redis_host = ENV["REDIS_HOST"] || "localhost"
        redis_port = ENV["REDIS_PORT"] || 6379
        Redis.new(host: redis_host, port: redis_port, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
      else
        Redis.new
      end
  end
end
