# frozen_string_literal: true

require "rails"

module Decidim
  module BulletinBoard
    module Dummy
      class Engine < ::Rails::Engine
        initializer "decidim-bulletin_board-dummy.assets" do |app|
          app.config.assets.precompile += ["manifest.js"]
        end
      end
    end
  end
end
