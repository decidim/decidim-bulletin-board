# frozen_string_literal: true

require "rails_helper"

RSpec.describe VoteJob do
  subject { described_class.perform_now(pending_message.id) }

  let!(:pending_message) { create(:pending_message, election: election, message: message, client: authority, private_key: private_key) }
  let(:election) { create(:election, status: :vote, authority: authority, authority_private_key: private_key) }
  let(:authority) { create(:authority, private_key: private_key) }
  let(:private_key) { generate(:private_key) }
  let(:message) { build(:vote_message, election: election) }

  it "processes the message" do
    expect { subject }.to change { PendingMessage.last.status } .from("enqueued").to("accepted")
  end

  context "when the message is rejected" do
    let(:message) { build(:vote_message, :invalid, election: election) }

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
