# frozen_string_literal: true

require "rails_helper"

RSpec.describe StartKeyCeremonyJob do
  subject { described_class.perform_now(pending_message.id) }

  let!(:pending_message) { create(:pending_message, election:, message:) }
  let(:election) { create(:election) }
  let(:message) { build(:start_key_ceremony_message, election:) }

  it "processes the message" do
    expect { subject }.to change { PendingMessage.last.status }.from("enqueued").to("accepted")
  end

  context "when the message was already processed" do
    let!(:pending_message) { create(:pending_message, election:, message:, status: :accepted) }

    it "doesn't change the message status" do
      expect { subject }.not_to(change { PendingMessage.last.status })
    end
  end
end
