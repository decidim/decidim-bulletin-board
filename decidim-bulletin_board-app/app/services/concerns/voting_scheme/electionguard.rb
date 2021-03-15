# frozen_string_literal: true

require "active_support/concern"

module VotingScheme
  module Electionguard
    extend ActiveSupport::Concern

    included do
      def to_h(dict)
        return dict unless dict.is_a?(PyCall::Dict)

        dict.inject({}) do |h, (k, v)|
          h.update(k => to_h(v))
        end
      end
    end
  end
end
