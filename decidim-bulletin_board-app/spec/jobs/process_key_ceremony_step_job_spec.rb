# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProcessKeyCeremonyStepJob do
  subject { described_class.perform_now(pending_message.id) }

  let!(:pending_message) { create(:pending_message, election: election, message: message, client: trustee, private_key: private_key) }
  let(:election) { create(:election, trustees_plus_keys: trustees_plus_keys) }
  let(:trustees_plus_keys) { generate_list(:private_key, 3).map { |key| [create(:trustee, private_key: key), key] } }
  let(:trustee) { trustees_plus_keys.first.first }
  let(:private_key) { trustees_plus_keys.first.last }
  let(:message) { build(:key_ceremony_message, election: election) }

  it "processes the message" do
    expect { subject }.to change { PendingMessage.last.status } .from("enqueued").to("accepted")
  end

  context "when the message is rejected" do
    let(:message) { build(:key_ceremony_message, :invalid, election: election) }

    it "rejects the message" do
      expect { subject }.to change { PendingMessage.last.status } .from("enqueued").to("rejected")
    end
  end

  context "when the message was already processed" do
    before { described_class.perform_now(pending_message.id) }

    it "doesn't change the message status" do
      expect { subject }.not_to change { PendingMessage.last.status } .from("accepted")
    end
  end
end
