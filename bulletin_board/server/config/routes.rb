# frozen_string_literal: true

require "sidekiq/web"
Rails.application.routes.draw do
  scope "/api" do
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/api"
    get "/docs", to: "documentation#show", as: :documentation
    get "/", to: redirect("/api/docs")
    post "/", to: "graphql#execute", as: :api_endpoint
  end

  root to: "pages#index"

  if !Rails.env.production? || ENV["SANDBOX"]
    mount Sidekiq::Web => "/sidekiq"
    scope "/sandbox", module: :sandbox, as: :sandbox do
      resources :elections, only: [:new, :create, :index] do
        member do
          get :start_key_ceremony
          get :key_ceremony
          get :start_vote
          get :vote
          post :vote
          get :in_person_vote
          post :in_person_vote
          post :generate_bulk_votes
          get :download_bulk_votes
          get :load_test_stats
          get :end_vote
          get :start_tally
          get :tally
          post :report_missing_trustee
          get :publish_results
          get :results
        end
      end
    end
  end
end
