# frozen_string_literal: true

require "active_support/concern"

module Message
  extend ActiveSupport::Concern

  included do
    def message_identifier
      @message_identifier ||= Decidim::BulletinBoard::MessageIdentifier.new(message_id)
    end

    def visible_for_all?
      # TODO: hardcoded until we solve https://github.com/decidim/decidim-bulletin-board/issues/163
      # !VotingScheme::BulletinBoard.results_message?(
      #   election.voting_scheme_name, message_identifier.type_subtype
      # ) || election.results_published?
      true
    end
  end
end
