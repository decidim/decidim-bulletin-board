# frozen_string_literal: true

Rails.application.routes.draw do
  scope "/api" do
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/api"
    get "/docs", to: "documentation#show", as: :documentation
    get "/", to: redirect("/api/docs")
    post "/", to: "graphql#execute"
  end

  mount ActionCable.server, at: "/cable"

  if Rails.env.development? || Rails.env.test?
    scope "/sandbox", module: :sandbox, as: :sandbox do
      resources :elections, only: [:index] do
        member do
          get :key_ceremony
          get :tally
        end
      end
    end
  end
end
