# frozen_string_literal: true

module Mutations
  class BaseMutation < GraphQL::Schema::Mutation
    def find_authority(message_id)
      message_identifier = Decidim::BulletinBoard::MessageIdentifier.new(message_id)
      message_identifier.from_authority? && Authority.find_by(unique_id: message_identifier.author_id, api_key: context[:api_key]) ||
        message_identifier.from_voter? && Authority.find_by(api_key: context[:api_key])
    end

    def find_trustee(message_id)
      message_identifier = Decidim::BulletinBoard::MessageIdentifier.new(message_id)
      message_identifier.from_trustee? && Trustee.find_by(unique_id: message_identifier.unique_trustee_id(message_identifier.authority_id, message_identifier.author_id))
    end
  end
end
