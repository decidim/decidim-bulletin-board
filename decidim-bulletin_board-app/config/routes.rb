# frozen_string_literal: true

Rails.application.routes.draw do
  scope "/api" do
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/api"
    get "/docs", to: "documentation#show", as: :documentation
    get "/", to: redirect("/api/docs")
    post "/", to: "graphql#execute"
  end

  root to: "pages#index"

  if Rails.env.development? || Rails.env.test?
    scope "/sandbox", module: :sandbox, as: :sandbox do
      resources :elections, only: [:index] do
        member do
          get :start_key_ceremony
          get :key_ceremony
          get :start_vote
          get :vote
          post :vote
          get :end_vote
          get :start_tally
          get :tally
          get :publish_results
        end
      end
    end
  end
end
