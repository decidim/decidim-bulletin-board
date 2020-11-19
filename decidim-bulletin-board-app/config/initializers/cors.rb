# frozen_string_literal: true

return if Rails.application.config.settings.cors_origin_allowed.blank?

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "*"
    resource "*", headers: :any, methods: [:get, :post, :patch, :put]
  end
end
