# frozen_string_literal: true

require "rails_helper"

module VotingScheme
  RSpec.describe ElectionGuard do
    subject(:instance) { described_class.new(election) }

    let(:election) { build(:election, status: nil, voting_scheme: :election_guard) }

    describe "process_message" do
      subject { instance.process_message(message_identifier, message) }

      let(:message_identifier) { MessageIdentifier.new(message["message_id"]) }

      context "when creating an election" do
        let(:message) { election.manifest }

        it "updates the wrapper state" do
          expect { subject } .to change(instance, :backup)
        end
      end

      context "when processing a key ceremony message" do
        before { instance.process_message(manifest_message_identifier, election.manifest) }

        let(:manifest_message_identifier) { MessageIdentifier.new(election.manifest["message_id"]) }
        let(:message) { build(:key_ceremony_message, :election_guard, election: election) }

        it "updates the wrapper state" do
          expect { subject } .to change(instance, :backup)
        end
      end
    end
  end
end
