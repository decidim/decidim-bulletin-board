# frozen_string_literal: true

require "rails_helper"

RSpec.describe CreateElection do
  subject { described_class.new(authority, signed_data) }

  let(:private_key) { generate(:private_key) }
  let(:authority) { create(:authority, private_key: private_key) }
  let(:signature_key) { private_key.keypair }
  let(:signed_data) { JWT.encode(payload.as_json, signature_key, "RS256") }
  let(:payload) { build(:create_election_message, authority: authority, **create_election_message_params) }
  let(:create_election_message_params) { {} }

  shared_examples "create election succeeds" do
    it "creates the election" do
      expect { subject.call }.to change(Election, :count).by(1)
    end

    it "broadcasts ok" do
      expect { subject.call }.to broadcast(:ok)
    end
  end

  it_behaves_like "create election succeeds"

  context "when the signature is not right" do
    let(:signature_key) { generate(:private_key).keypair }

    it "detects that the used key is not the right one" do
      expect { subject.call }.not_to change(Election, :count)
    end

    it "broadcasts invalid" do
      expect { subject.call }.to broadcast(:invalid, "Signature verification raised")
    end
  end

  context "when the election already exists" do
    let!(:election) { create(:election, authority: authority, unique_id: payload["election_id"]) }

    it "broadcasts invalid" do
      expect { subject.call }.to broadcast(:invalid, "The data provided was not valid or not unique")
    end
  end

  context "when the signed_data format is invalid" do
    let(:signed_data) { "HOLAAMIGOTEQUIEROMUCHO" }

    it "broadcasts invalid" do
      expect { subject.call }.to broadcast(:invalid, "Not enough or too many segments")
    end
  end

  context "when the iat is in the past" do
    let(:create_election_message_params) { { iat: 1.day.ago.to_i } }

    it "broadcasts invalid" do
      expect { subject.call }.to broadcast(:invalid, "Message is too old to be accepted")
    end
  end

  context "when the iat is in the future" do
    let(:create_election_message_params) { { iat: 1.day.from_now.to_i } }

    it "broadcasts invalid" do
      expect { subject.call }.to broadcast(:invalid, "Invalid iat")
    end
  end

  context "when the start date is too soon" do
    let(:create_election_message_params) { { start_date: 1.minute.from_now } }

    it "broadcasts invalid" do
      expect { subject.call }.to broadcast(:invalid, "Election should start at least in 2 hours from now.")
    end
  end
end
