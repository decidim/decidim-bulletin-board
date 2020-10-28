# frozen_string_literal: true

Rails.application.routes.draw do
  scope "/api" do
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/api"
    get "/docs", to: "documentation#show", as: :documentation
    get "/", to: redirect("/api/docs")
    post "/", to: "graphql#execute"
  end
end
