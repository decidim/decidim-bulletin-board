# frozen_string_literal: true

require "rails"

module Decidim
  module BulletinBoard
    class Engine < ::Rails::Engine
      isolate_namespace Decidim::BulletinBoard

      initializer "decidim_bulletin_board.assets" do |app|
        app.config.assets.precompile += %w(decidim_bulletin_board_manifest.js)
      end
    end
  end
end
