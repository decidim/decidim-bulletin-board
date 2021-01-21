# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProcessTallyStepJob do
  subject { described_class.perform_now(pending_message.id) }

  let!(:pending_message) { create(:pending_message, election: election, message: message, client: trustee, private_key: private_key) }
  let(:election) { create(:election, status: :tally, voting_scheme_state: voting_scheme_state) }
  let(:voting_scheme_state) { Marshal.dump(joint_election_key: 1, trustees: Trustee.first(3).map(&:unique_id), shares: []) }
  let(:trustee) { Trustee.first }
  let(:private_key) { Test::PrivateKeys.trustees_private_keys.first }
  let(:message) { build(:tally_share_message, content_traits: content_traits, election: election, trustee: trustee) }
  let(:content_traits) { [] }

  it "processes the message" do
    expect { subject }.to change { PendingMessage.last.status } .from("enqueued").to("accepted")
  end

  context "when the message is rejected" do
    let(:content_traits) { [:invalid] }

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
