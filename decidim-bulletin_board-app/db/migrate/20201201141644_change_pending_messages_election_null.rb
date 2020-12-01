class ChangePendingMessagesElectionNull < ActiveRecord::Migration[6.0]
  def change
    change_column_null :pending_messages, :election_id, false
  end
end
