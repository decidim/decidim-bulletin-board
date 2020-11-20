# frozen_string_literal: true

require "spec_helper"

RSpec.describe ProcessKeyCeremonyStepJob do
  subject { described_class.perform_now(pending_message.id) }

  let!(:pending_message) { create(:pending_message, message: message) }
  let(:election) { create(:election) }
  let(:message) { build(:key_ceremony_message, election: election) }

  it "processes the message" do
    expect { subject }.to change { PendingMessage.last.status } .from("enqueued").to("accepted")
  end

  it "sets the message election" do
    expect { subject }.to change { PendingMessage.last.election } .from(nil).to(election)
  end

  context "when the message is rejected" do
    let(:message) { build(:key_ceremony_message, :invalid, election: election) }

    it "rejects the message" do
      expect { subject }.to change { PendingMessage.last.status } .from("enqueued").to("rejected")
    end

    it "sets the message election" do
      expect { subject }.to change { PendingMessage.last.election } .from(nil).to(election)
    end
  end

  context "when the message was already processed" do
    before { described_class.perform_now(pending_message.id) }

    it "doesn't change the message status" do
      expect { subject }.not_to change { PendingMessage.last.status } .from("accepted")
    end

    it "doesn't change the message election" do
      expect { subject }.not_to change { PendingMessage.last.election } .from(election)
    end
  end
end
