# frozen_string_literal: true

require "active_support/concern"

module Message
  extend ActiveSupport::Concern

  included do
    def message_identifier
      @message_identifier ||= Decidim::BulletinBoard::MessageIdentifier.new(message_id)
    end

    def visible_for_all?
      message_identifier.type != "tally" || election.results_published?
    end
  end
end