# frozen_string_literal: true

FactoryBot.define do
  factory :authority do
    name { "Decidim Authority" }
    public_key { "public_key" }
    api_key { "api_key" }
  end
end
