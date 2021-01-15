# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe CreateElection do
  subject { described_class.call(client, message_id, signed_data) }

  include_context "with a signed message"

  let(:client) { Authority.first }
  let(:message_type) { :create_election_message }

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
    let!(:existing_election) { create(:election) }
    let(:extra_message_params) { { election_id: existing_election.unique_id } }

    it_behaves_like "create election fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "The data provided was not valid or not unique")
    end
  end

  context "when the voting scheme is invalid" do
    let(:extra_message_params) { { voting_scheme: "paper" } }

    it_behaves_like "create election fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "A valid Voting Scheme must be specified")
    end
  end

  context "when the title is missing" do
    let(:extra_message_params) { { title: "" } }

    it_behaves_like "create election fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Missing title")
    end
  end

  context "when the start date is after the end date" do
    let(:extra_message_params) { { start_date: 1.year.from_now } }

    it_behaves_like "create election fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Starting date cannot be after the end date")
    end
  end

  context "when the start date is too soon" do
    let(:extra_message_params) { { start_date: 1.minute.from_now } }

    it_behaves_like "create election fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "Election should start at least in 2 hours from now.")
    end
  end

  context "when there are no questions" do
    let(:extra_message_params) { { number_of_questions: 0 } }

    it_behaves_like "create election fails"

    it "broadcasts invalid" do
      expect { subject }.to broadcast(:invalid, "There must be at least 1 question for the election")
    end
  end

  context "when the client is a trustee" do
    let(:client) { Trustee.first }
    let(:private_key) { DevPrivateKeys.trustees_private_keys.first }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid client")
    end
  end

  context "when the message author is not the same authority" do
    let(:extra_message_params) { { authority: create(:authority) } }

    it "broadcast invalid" do
      expect { subject }.to broadcast(:invalid, "Invalid message author")
    end
  end
end
