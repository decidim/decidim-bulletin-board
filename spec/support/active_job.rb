# frozen_string_literal: true

module ActiveJobSpecHelper
  def self.included(base)
    base.before do |example|
      ActiveJob::Base.queue_adapter = :test if example.metadata[:jobs]
    end
  end
end

RSpec.configure do |config|
  config.include ActiveJobSpecHelper
end
