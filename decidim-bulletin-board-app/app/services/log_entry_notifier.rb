# frozen_string_literal: true

class LogEntryNotifier
  def initialize(log_entry)
    @log_entry = log_entry
  end

  def notify_subscribers
    DecidimBulletinBoardSchema.subscriptions.trigger(
      :election_log_entry_added, {
        election_unique_id: election.unique_id
      },
      log_entry: log_entry
    )
  end

  private

  attr_reader :log_entry
  delegate :election, to: :log_entry
end