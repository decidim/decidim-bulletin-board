# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Documentation page", type: :request do
  subject { get "/api/docs" }

  it "returns the documentation home page" do
    subject
    expect(response.body).to include("Bulletin Board Version API documentation")
  end

  it "includes the GraphQL schema" do
    subject
    expect(response.body).to include("window.renderDocumentation(\"/api\")")
  end
end
