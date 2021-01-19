# frozen_string_literal: true

require "rails_helper"
require "./spec/commands/shared/log_entry_validations"

RSpec.describe ProcessTallyStep do
  subject { described_class.call(client, message_id, signed_data) }

  include_context "with a signed message"

  let!(:election) { create(:election, status: election_status, voting_scheme_state: voting_scheme_state) }
  let(:election_status) { :tally }

  shared_examples "tally fails" do
    it "doesn't create a log entry" do
      expect { subject }.not_to change(LogEntry, :count)
    end

    it "doesn't change the voting scheme state" do
      expect { subject }.not_to(change { Election.last.voting_scheme_state })
    end
  end

  describe "tally start message" do
    let(:voting_scheme_state) { Marshal.dump(joint_election_key: 1, trustees: Trustee.first(3).map(&:unique_id)) }
    let(:client) { Authority.first }
    let(:message_type) { :tally_start_message }
    let(:message_params) { { election: election } }

    it "broadcast ok" do
      expect { subject }.to broadcast(:ok)
    end

    it "creates the log entry for the message and another for the response" do
      expect { subject }.to change(LogEntry, :count).by(2)
    end

    it "persists the new state for the voting scheme" do
      expect { subject }.to(change { Election.last.voting_scheme_state })
    end

    it "doesn't change the election status" do
      expect { subject }.not_to change { Election.last.status } .from("tally")
    end

    it_behaves_like "with an invalid signed data", "tally fails"

    context "when the election status is not tally" do
      let(:election_status) { :vote }

      it_behaves_like "tally fails"

      it "broadcasts invalid" do
        expect { subject }.to broadcast(:invalid, "The election is not in the right step")
      end
    end

    context "when the message author is not the same trustee" do
      let(:extra_message_params) { { authority: create(:authority) } }

      it_behaves_like "tally fails"

      it "broadcast invalid" do
        expect { subject }.to broadcast(:invalid, "Invalid message author")
      end
    end

    context "when the client is not the election authority" do
      let(:client) { create(:authority, private_key: private_key) }
      let(:private_key) { generate(:private_key) }

      it "broadcast invalid" do
        expect { subject }.to broadcast(:invalid, "Invalid client")
      end
    end
  end

  describe "tally share message" do
    let(:voting_scheme_state) { Marshal.dump(joint_election_key: 1, trustees: Trustee.first(3).map(&:unique_id), shares: shares_already_sent.map(&:unique_id)) }
    let(:shares_already_sent) { [] }
    let(:trustee) { Trustee.first }
    let(:client) { trustee }
    let(:private_key) { Test::PrivateKeys.trustees_private_keys.first }
    let(:message_type) { :tally_share_message }
    let(:message_params) { { election: election, trustee: trustee } }

    it "broadcast ok" do
      expect { subject }.to broadcast(:ok)
    end

    it "creates the log entry for the message" do
      expect { subject }.to change(LogEntry, :count).by(1)
    end

    it "persists the new state for the voting scheme" do
      expect { subject }.to(change { Election.last.voting_scheme_state })
    end

    it "doesn't change the election status" do
      expect { subject }.not_to change { Election.last.status } .from("tally")
    end

    context "when the voting scheme generates an answer" do
      let(:shares_already_sent) { Trustee.first(3).excluding(trustee) }

      it "broadcast ok" do
        expect { subject }.to broadcast(:ok)
      end

      it "creates the log entry for the message and another for the response" do
        expect { subject }.to change(LogEntry, :count).by(2)
      end

      it "persists the new state for the voting scheme" do
        expect { subject }.to(change { Election.last.voting_scheme_state })
      end

      it "changes the election status" do
        expect { subject }.to change { Election.last.status } .from("tally").to("results")
      end
    end

    it_behaves_like "with an invalid signed data", "tally fails"

    context "when the data is invalid" do
      let(:extra_message_params) { { content_traits: [:invalid] } }

      it_behaves_like "tally fails"

      it "broadcasts invalid" do
        expect { subject }.to broadcast(:invalid, "The owner_id doesn't match the sender trustee")
      end
    end

    context "when the trustee already sent the message" do
      let(:shares_already_sent) { [trustee] }

      it_behaves_like "tally fails"

      it "broadcasts invalid" do
        expect { subject }.to broadcast(:invalid, "The trustee already sent their share")
      end
    end

    context "when the election status is not tally" do
      let(:election_status) { :vote }

      it_behaves_like "tally fails"

      it "broadcasts invalid" do
        expect { subject }.to broadcast(:invalid, "The election is not in the right step")
      end
    end

    context "when the message author is not the same trustee" do
      let(:extra_message_params) { { trustee: create(:trustee) } }

      it_behaves_like "tally fails"

      it "broadcast invalid" do
        expect { subject }.to broadcast(:invalid, "Invalid message author")
      end
    end
  end
end
