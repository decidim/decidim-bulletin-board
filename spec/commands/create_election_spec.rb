# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe CreateElection do
  subject { described_class.call(authority, signed_data) }

  include_context "with a signed message"

  let(:authority) { create(:authority, private_key: private_key) }
  let(:message_type) { :create_election_message }
  let(:message_params) { { authority: authority } }

  it "creates the election" do
    expect { subject }.to change(Election, :count).by(1)
  end

  it "creates the election first log entry" do
    expect { subject }.to change(LogEntry, :count).by(1)
  end

  it "broadcasts ok" do
    expect { subject }.to broadcast(:ok)
  end

  shared_examples "create election fails" do
    it "doesn't create the election" do
      expect { subject }.not_to change(Election, :count)
    end

    it "doesn't create a log entry" do
      expect { subject }.not_to change(LogEntry, :count)
    end
  end

  it_behaves_like "with an invalid signed data", "create election fails"

  context "when the election already exists" do
    let!(:election) { create(:election, authority: authority, unique_id: payload["election_id"]) }

    it_behaves_like "create election fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The data provided was not valid or not unique")
    end
  end

  context "when the start date is too soon" do
    let(:extra_message_params) { { start_date: 1.minute.from_now } }

    it_behaves_like "create election fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Election should start at least in 2 hours from now.")
    end
  end
end
