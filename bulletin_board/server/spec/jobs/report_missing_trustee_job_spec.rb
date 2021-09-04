# frozen_string_literal: true

require "rails_helper"

RSpec.describe ReportMissingTrusteeJob do
  subject { described_class.perform_now(pending_message.id) }

  let!(:pending_message) { create(:pending_message, election: election, message: message) }
  let(:election) { create(:election, :tally) }
  let(:message) { build(:report_missing_trustee_message, election: election) }

  it "processes the message" do
    expect { subject }.to change { PendingMessage.last.status }.from("enqueued").to("accepted")
  end

  context "when the message was already processed" do
    before { described_class.perform_now(pending_message.id) }

    it "doesn't change the message status" do
      expect { subject }.not_to change { PendingMessage.last.status }.from("accepted")
    end
  end
end
