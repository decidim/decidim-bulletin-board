# frozen_string_literal: true

module Policies
  class VisibilityPolicy
    RULES = {
      Types::LogEntryType => {
        decoded_data: lambda do |parent, _args, context|
          results_published?(parent.object.election) ||
            parent.object.results_message? ||
            trustee?(context) ||
            authority?(parent.object.election, context)
        end
      },
      Types::MessageInterface => {
        signed_data: lambda do |parent, _args, context|
          results_published?(parent.object.election) ||
            parent.object.results_message? ||
            trustee?(context) ||
            authority?(parent.object.election, context)
        end
      },
      Types::ElectionType => {
        verifiable_results_hash: lambda do |parent, _args, context|
          results_published?(parent.object) || authority?(parent.object, context)
        end,
        verifiable_results_url: lambda do |parent, _args, context|
          results_published?(parent.object) || authority?(parent.object, context)
        end
      }
    }.freeze

    def self.trustee?(context)
      trustee_unique_id = context[:trustee_unique_id]
      return false if trustee_unique_id.blank?

      trustee = Client.find_by(unique_id: trustee_unique_id)
      return false if trustee.blank?

      begin
        decoded_api_key = JWT.decode(context[:api_key], trustee.public_key_rsa, true, verify_expiration: true, algorithm: "RS256").first.with_indifferent_access
        decoded_api_key[:trustee_unique_id] == trustee_unique_id
      rescue JWT::ExpiredSignature
        false
      end
    end

    def self.authority?(election, context)
      election.authority.api_key == context[:api_key]
    end

    def self.results_published?(election)
      election.results_published?
    end

    def self.guard(type, field)
      RULES.dig(type, field.to_s.underscore.to_sym)
    end
  end
end
