# frozen_string_literal: true

require "rails_helper"

module VotingScheme
  module Electionguard
    RSpec.describe BulletinBoard do
      subject(:instance) { described_class.new(election) }

      let(:election) { build(:electionguard_election, last_step:) }

      describe "process_message" do
        subject do
          instance.process_message(Decidim::BulletinBoard::MessageIdentifier.new(log_entry.message_id), log_entry.decoded_data)
        end

        before do
          election.log_entries.first(election.log_entries.length - dont_process_count).each do |log_entry|
            instance.process_message(Decidim::BulletinBoard::MessageIdentifier.new(log_entry.message_id), log_entry.decoded_data)
          end
        end

        let(:log_entry) { election.log_entries[-dont_process_count] }

        context "when creating an election" do
          let(:last_step) { :create_election }
          let(:dont_process_count) { 1 }

          it "updates the wrapper state" do
            expect { subject }.to change(instance, :backup)
          end
        end

        shared_examples "receiving the public key for the trustee" do |trustee_number|
          context "when receiving the public key for the trustee #{trustee_number}" do
            let(:last_step) { :"key_ceremony.trustee_election_keys" }
            let(:dont_process_count) { 4 - trustee_number }

            it "updates the wrapper state" do
              expect { subject }.to change(instance, :backup)
            end
          end
        end

        include_examples "receiving the public key for the trustee", 1
        include_examples "receiving the public key for the trustee", 2
        include_examples "receiving the public key for the trustee", 3

        context "when completing the whole key ceremony phase" do
          let(:last_step) { :end_key_ceremony }
          let(:dont_process_count) { 1 }

          it "returns the joint election key message" do
            expect(JSON.parse(election.log_entries.last.decoded_data["content"])["election_joint_key"]["joint_public_key"]).not_to be_nil
          end
        end
      end
    end
  end
end
