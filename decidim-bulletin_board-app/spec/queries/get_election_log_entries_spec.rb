# frozen_string_literal: true

require "rails_helper"

RSpec.describe "GetElectionLogEntries" do
  subject { DecidimBulletinBoardSchema.execute(query, context: context) }

  let!(:election) { create(:election) }
  let(:context) { {} }
  let(:first_log_entry) { election.log_entries.first }
  let(:election_unique_id) { election.unique_id }
  let(:query) do
    <<~GQL
      query GetElectionLogEntries {
        election(uniqueId: "#{election_unique_id}") {
          logEntries {
            messageId
            signedData
          }
        }
      }
    GQL
  end

  it "returns the election's log entries" do
    expect(subject.deep_symbolize_keys).to include(
      data: {
        election: {
          logEntries: [
            {
              messageId: first_log_entry.message_id,
              signedData: first_log_entry.signed_data
            }
          ]
        }
      }
    )
  end

  context "when the election doesn't exist" do
    let(:election_unique_id) { "foo.bar.1" }

    it "returns nil" do
      expect(subject.deep_symbolize_keys).to include(
        data: {
          election: nil
        }
      )
    end
  end

  describe "log entries with temporary hidden data" do
    let!(:election) { create(:election, :tally) }
    let(:tally_cast) { create(:log_entry, :by_bulletin_board, election: election, message: build(:tally_cast_message, election: election)) }
    let(:tally_share) { create(:log_entry, :by_trustee, election: election, message: build(:tally_share_message, election: election)) }
    let(:end_tally) { create(:log_entry, :by_bulletin_board, election: election, message: build(:end_tally_message, election: election)) }

    before { tally_cast && tally_share && end_tally }

    it "hides the signed data" do
      expect(subject.deep_symbolize_keys).to include(
        data: {
          election: {
            logEntries: [
              {
                messageId: first_log_entry.message_id,
                signedData: first_log_entry.signed_data
              },
              {
                messageId: tally_cast.message_id,
                signedData: tally_cast.signed_data
              },
              {
                messageId: tally_share.message_id,
                signedData: nil
              },
              {
                messageId: end_tally.message_id,
                signedData: nil
              }
            ]
          }
        }
      )
    end

    shared_examples "showing the signed data" do
      it "shows the signed data" do
        expect(subject.deep_symbolize_keys).to include(
          data: {
            election: {
              logEntries: [
                {
                  messageId: first_log_entry.message_id,
                  signedData: first_log_entry.signed_data
                },
                {
                  messageId: tally_cast.message_id,
                  signedData: tally_cast.signed_data
                },
                {
                  messageId: tally_share.message_id,
                  signedData: tally_share.signed_data
                },
                {
                  messageId: end_tally.message_id,
                  signedData: end_tally.signed_data
                }
              ]
            }
          }
        )
      end
    end

    context "when the client is an authority" do
      let(:context) { { api_key: election.authority.api_key } }

      it_behaves_like "showing the signed data"
    end

    context "when the results are published" do
      let(:election) { create(:election, :results_published) }

      it_behaves_like "showing the signed data"
    end
  end
end
