# frozen_string_literal: true

require "rails_helper"

RSpec.describe RedisProvider do
  subject { klass.new }

  let(:klass) do
    Class.new do
      include RedisProvider

      def access
        redis
      end
    end
  end

  describe "#redis" do
    let(:redis) { subject.access }
    let(:options) { redis._client.options }

    it "returns a Redis instance with the correct configurations" do
      expect(redis).to be_a(Redis)
      expect(options).to include(
        host: ENV["REDIS_HOST"] || "localhost",
        port: ENV["REDIS_PORT"] || 6379,
        ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE }
      )
    end

    context "when in production mode" do
      before do
        allow(Rails.env).to receive(:production?).and_return(true)
      end

      it "returns a Redis instance with default configurations" do
        expect(redis).to be_a(Redis)
        expect(options).to include(
          host: "127.0.0.1",
          port: 6379
        )
        expect(options.keys).not_to include(:ssl_params)
      end
    end
  end
end
