# frozen_string_literal: true

require "active_support/concern"
require "message_identifier"

module HasMessageIdentifier
  extend ActiveSupport::Concern

  included do
    attr_accessor :message_id

    def message_identifier
      @message_identifier ||= MessageIdentifier.new(message_id)
    end
  end
end