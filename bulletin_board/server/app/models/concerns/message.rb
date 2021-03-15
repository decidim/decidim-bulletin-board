# frozen_string_literal: true

require "active_support/concern"

module Message
  extend ActiveSupport::Concern

  included do
    def message_identifier
      @message_identifier ||= Decidim::BulletinBoard::MessageIdentifier.new(message_id)
    end

    def visible_for_all?
      !VotingScheme::BulletinBoard.results_message?(
        election.voting_scheme_name, message_identifier.type_subtype
      ) || election.results_published?
    end
  end
end
