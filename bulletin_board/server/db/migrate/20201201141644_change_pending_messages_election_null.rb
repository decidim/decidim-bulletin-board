# frozen_string_literal: true

class ChangePendingMessagesElectionNull < ActiveRecord::Migration[6.1]
  def change
    change_column_null :pending_messages, :election_id, false
  end
end
