# frozen_string_literal: true

module Policies
  class VisibilityForAll
    RULES = {
      Types::LogEntryType => {
        decodedData: lambda do |parent, _args, context|
          parent.object.visible_for_all? || trustee? || authority?(parent.object, context)
        end
      },
      Types::MessageInterface => {
        signedData: lambda do |parent, _args, context|
          parent.object.visible_for_all? || trustee? || authority?(parent.object, context)
        end
      }
    }.freeze

    def self.trustee?
      false
    end

    def self.authority?(object, context)
      object.election.authority.api_key == context[:api_key]
    end

    def self.guard(type, field)
      RULES.dig(type, field)
    end
  end
end
