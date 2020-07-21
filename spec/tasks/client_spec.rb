# frozen_string_literal: true

require "rails_helper"

Rails.application.load_tasks

describe "client.rake" do
  it "creates a new authority" do
    Rake::Task["client:add_authority"].invoke("Decidim Barna", "djfhdjfkhdf")
  end
end
