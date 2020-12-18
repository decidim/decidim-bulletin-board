# frozen_string_literal: true

module Types
  class SubscriptionType < Types::BaseObject
    field :election_log_entry_added, subscription: Subscriptions::ElectionLogEntryAdded
  end
end
