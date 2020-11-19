# frozen_string_literal: true

require "rails_helper"

RSpec.describe LogEntryNotifier do
  let(:election) { create(:election) }
  let(:log_entry) { election.log_entries.first }
  subject { described_class.new(log_entry) }

  describe "notify_subscribers" do
    it "triggers the `election_log_entry_added` subscription with the correct params" do
      allow(DecidimBulletinBoardSchema.subscriptions).to receive(:trigger)
      subject.notify_subscribers
      expect(DecidimBulletinBoardSchema.subscriptions).to have_received(:trigger).with(
        :election_log_entry_added,
        { election_unique_id: election.unique_id },
        log_entry: log_entry
      )
    end
  end
end
