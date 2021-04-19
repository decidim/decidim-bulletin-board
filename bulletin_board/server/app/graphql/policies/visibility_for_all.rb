# frozen_string_literal: true

module Policies
  class VisibilityForAll
    RULES = {
      Types::LogEntryType => {
        decodedData: lambda do |parent, _args, context|
          parent.object.visible_for_all? || trustee?(context) || authority?(parent.object, context)
        end
      },
      Types::MessageInterface => {
        signedData: lambda do |parent, _args, context|
          parent.object.visible_for_all? || trustee?(context) || authority?(parent.object, context)
        end
      }
    }.freeze

    def self.trustee?(context)
      trustee_unique_id = context[:trustee_unique_id]
      return false if trustee_unique_id.blank?

      trustee = Client.where(unique_id: trustee_unique_id).first
      return false if trustee.blank?

      decoded_api_key = JWT.decode(context[:api_key], trustee.public_key_rsa, true, verify_iat: true, algorithm: "RS256").first.with_indifferent_access
      decoded_api_key[:trustee_unique_id] == trustee_unique_id
    end

    def self.authority?(object, context)
      object.election.authority.api_key == context[:api_key]
    end

    def self.guard(type, field)
      RULES.dig(type, field)
    end
  end
end
