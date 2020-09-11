# frozen_string_literal: true

FactoryBot.define do
  factory :authority do
    name { Faker::Name.unique.name }
    public_key { Faker::Internet.password }
    api_key { Faker::Internet.unique.uuid }
  end
end
