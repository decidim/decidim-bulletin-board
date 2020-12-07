# frozen_string_literal: true

require "spec_helper"

RSpec.describe PendingMessage do
  subject { pending_message }

  let(:pending_message) { build(:pending_message) }

  it { expect(subject).to be_enqueued }
  it { expect(subject).not_to be_processed }
  it { expect(subject).not_to be_accepted }
  it { expect(subject).not_to be_rejected }

  context "when message has been accepted" do
    let(:pending_message) { build(:pending_message, :accepted) }

    it { expect(subject).not_to be_enqueued }
    it { expect(subject).to be_processed }
    it { expect(subject).to be_accepted }
    it { expect(subject).not_to be_rejected }
  end

  context "when message has been rejected" do
    let(:pending_message) { build(:pending_message, :rejected) }

    it { expect(subject).not_to be_enqueued }
    it { expect(subject).to be_processed }
    it { expect(subject).not_to be_accepted }
    it { expect(subject).to be_rejected }
  end
end
