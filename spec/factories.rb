# frozen_string_literal: true

FactoryBot.define do
  factory :authority do
    name { Faker::Name.unique.name }
    public_key { OpenSSL::PKey::RSA.new(1024).public_key.to_s }
    api_key { Faker::Internet.unique.uuid }
  end
end
