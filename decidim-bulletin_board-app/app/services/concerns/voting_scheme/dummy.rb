# frozen_string_literal: true

require "active_support/concern"

module VotingScheme
  module Dummy
    extend ActiveSupport::Concern

    included do
      def parse_content(message)
        JSON.parse(message.delete(:content) || "null")&.with_indifferent_access
      end
    end
  end
end
