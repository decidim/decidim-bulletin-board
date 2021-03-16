# frozen_string_literal: true

require "rails"

module VotingSchemes
  module Dummy
    class Engine < ::Rails::Engine
      isolate_namespace VotingSchemes::Dummy
    end
  end
end
