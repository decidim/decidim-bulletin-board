# frozen_string_literal: true

require "rails_helper"

RSpec.describe EnqueueMessage do
  subject { described_class.call(client, message_id, signed_data, job) }

  let(:election) { create(:election) }
  let(:client) { election.trustees.first }
  let(:message_id) { "#{election.unique_id}.key_ceremony.trustee_election_keys+t.#{client.unique_id}" }
  let(:signed_data) { "SOME SIGNED DATA THAT WILL NOT BE VALIDATED" }
  let(:job) { ProcessKeyCeremonyStepJob }

  it "broadcasts ok" do
    expect { subject }.to broadcast(:ok)
  end

  it "adds the message to the pending messages table" do
    expect { subject }.to change(PendingMessage, :count).by(1)
  end

  it "stores the message client" do
    subject
    expect(PendingMessage.last.client).to eq(client)
  end

  it "stores the message election" do
    subject
    expect(PendingMessage.last.election).to eq(election)
  end

  it "stores the message identifier" do
    subject
    expect(PendingMessage.last.message_id).to eq(message_id)
  end

  it "stores the message signed data" do
    subject
    expect(PendingMessage.last.signed_data).to eq(signed_data)
  end

  it "enqueues the job to process the message", :jobs do
    subject
    expect(job).to have_been_enqueued
  end

  describe "broadcasting invalid" do
    context "with pending messages" do
      let!(:pending_message) { create(:pending_message, :message_model, election: election, client: client, message_id: message_id) }

      it "is not valid" do
        expect { subject }.to broadcast(:invalid)
      end
    end

    context "without client" do
      let(:client) { nil }
      let(:message_id) { nil }

      it "is not valid" do
        expect { subject }.to broadcast(:invalid)
      end
    end

    context "without election" do
      let(:client) { nil }
      let(:election) { nil }
      let(:message_id) { nil }

      it "is not valid" do
        expect { subject }.to broadcast(:invalid)
      end
    end

    context "without signed data" do
      let(:signed_data) { nil }

      it "is not valid" do
        expect { subject }.to broadcast(:invalid)
      end
    end
  end
end
