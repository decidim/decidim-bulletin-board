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

  it "enqueues the job to process the message", :jobs do
    subject
    expect(job).to have_been_enqueued
  end
end
