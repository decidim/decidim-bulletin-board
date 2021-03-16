# frozen_string_literal: true

require "rails"

module VotingSchemes
  module Electionguard
    class Engine < ::Rails::Engine
      isolate_namespace VotingSchemes::Electionguard

      initializer "static assets" do |app|
        app.middleware.insert_before(::ActionDispatch::Static, ::ActionDispatch::Static, "#{root}/public")
      end
    end
  end
end
