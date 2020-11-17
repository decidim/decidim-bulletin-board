# frozen_string_literal: true

module Types
  class SubscriptionType < Types::BaseObject
    extend GraphQL::Subscriptions::SubscriptionRoot

    field :election_log_entry_added, subscription: Subscriptions::ElectionLogEntryAdded
  end
end
