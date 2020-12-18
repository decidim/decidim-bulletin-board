# frozen_string_literal: true

require "active_support/concern"

module HasMessageIdentifier
  extend ActiveSupport::Concern

  included do
    attr_accessor :message_id

    def message_identifier
      @message_identifier ||= Decidim::BulletinBoard::MessageIdentifier.new(message_id)
    end

    def election
      @election ||= Election.find_by(unique_id: message_identifier.election_id)
    end
  end
end
