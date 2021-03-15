# frozen_string_literal: true

require "active_support/concern"

module VotingScheme
  module Dummy
    extend ActiveSupport::Concern

    included do
      def process_message(message_identifier, message)
        method_name = :"process_#{message_identifier.type}_message"
        content = parse_content(message)
        return [] unless respond_to?(method_name, true)

        @response = nil
        method(method_name).call(message_identifier, message, content)
        if @response
          [@response]
        else
          []
        end
      end

      def parse_content(message)
        JSON.parse(message.delete(:content) || "null")&.with_indifferent_access
      end
    end
  end
end
