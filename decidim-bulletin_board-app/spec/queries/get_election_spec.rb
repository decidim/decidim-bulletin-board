# frozen_string_literal: true

require "rails_helper"

RSpec.describe "GetElection" do
  subject { DecidimBulletinBoardSchema.execute(query, context: context) }

  let(:election) { create(:election) }
  let(:context) { {} }
  let(:query) do
    <<~GQL
      query GetElection {
        election(uniqueId: "#{election.unique_id}") {
          id
          title
          status
          authority {
            id
            name
            publicKey
            type
          }
          trustees {
            id
            name
            publicKey
            type
          }
          logEntries {
            messageId
          }
          verifiableResultsHash
          verifiableResultsUrl
        }
      }
    GQL
  end

  it "returns the elections information" do
    expect(subject.deep_symbolize_keys).to include(
      data: {
        election: {
          id: election.unique_id,
          title: election.title.deep_symbolize_keys,
          status: "created",
          authority: {
            id: election.authority.unique_id,
            name: election.authority.name,
            publicKey: election.authority.public_key.deep_symbolize_keys,
            type: "Authority"
          },
          trustees: election.trustees.map do |trustee|
            {
              id: trustee.unique_id,
              name: trustee.name,
              publicKey: trustee.public_key.deep_symbolize_keys,
              type: "Trustee"
            }
          end,
          logEntries: election.log_entries.map do |log_entry|
            {
              messageId: log_entry.message_id
            }
          end,
          verifiableResultsHash: nil,
          verifiableResultsUrl: nil
        }
      }
    )
  end

  context "when the election has published its results" do
    let(:election) { create(:election, :results_published) }

    it "returns the elections information with the verifiable results" do
      expect(subject.deep_symbolize_keys).to include(
        data: {
          election: {
            id: election.unique_id,
            title: election.title.deep_symbolize_keys,
            status: election.status,
            authority: {
              id: election.authority.unique_id,
              name: election.authority.name,
              publicKey: election.authority.public_key.deep_symbolize_keys,
              type: "Authority"
            },
            trustees: election.trustees.map do |trustee|
              {
                id: trustee.unique_id,
                name: trustee.name,
                publicKey: trustee.public_key.deep_symbolize_keys,
                type: "Trustee"
              }
            end,
            logEntries: election.log_entries.map do |log_entry|
              {
                messageId: log_entry.message_id
              }
            end,
            verifiableResultsHash: "DEUES1tHaoxDH4FKS1NLB3SCTSbycqfAARsLrqL1wmE=",
            verifiableResultsUrl: match(%r{/rails/active_storage/blobs/.*/verifiable-results.tar/})
          }
        }
      )
    end
  end
end
