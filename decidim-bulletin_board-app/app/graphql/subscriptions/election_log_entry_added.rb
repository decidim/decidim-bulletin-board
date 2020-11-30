# frozen_string_literal: true

module Subscriptions
  class ElectionLogEntryAdded < BaseSubscription
    argument :election_unique_id, String, required: true

    field :log_entry, Types::LogEntryType, null: false
  end
end
