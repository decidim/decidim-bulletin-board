# frozen_string_literal: true

require "rails_helper"
require "message_identifier"

RSpec.describe MessageIdentifier do
  subject(:instance) { described_class.new(message_id) }

  let(:message_id) { "decidim-barcelona.26.create_election+a.decidim-barcelona" }

  it { expect(subject).to be_from_authority }
  it { expect(subject).not_to be_from_trustee }
  it { expect(subject).not_to be_from_voter }
  it { expect(subject.author_type).to eq(:authority) }
  it { expect(subject.author_id).to eq("decidim-barcelona") }
  it { expect(subject.authority_id).to eq("decidim-barcelona") }
  it { expect(subject.election_id).to eq("decidim-barcelona.26") }
  it { expect(subject.type).to eq("create_election") }
  it { expect(subject.subtype).to be_nil }
  it { expect(subject.to_s).to eq(message_id) }

  context "when the message was created by a trustee" do
    let(:message_id) { "decidim-barcelona.26.key_ceremony.trustee_election_keys+t.trustee-1" }

    it { expect(subject).not_to be_from_authority }
    it { expect(subject).to be_from_trustee }
    it { expect(subject).not_to be_from_voter }
    it { expect(subject.author_type).to eq(:trustee) }
    it { expect(subject.author_id).to eq("trustee-1") }
    it { expect(subject.authority_id).to eq("decidim-barcelona") }
    it { expect(subject.election_id).to eq("decidim-barcelona.26") }
    it { expect(subject.type).to eq("key_ceremony") }
    it { expect(subject.subtype).to eq("trustee_election_keys") }
    it { expect(subject.to_s).to eq(message_id) }
  end

  context "when the message was created by the bulletin board" do
    let(:message_id) { "decidim-barcelona.26.key_ceremony.joint_election_key+b.metadecidim" }

    it { expect(subject).not_to be_from_authority }
    it { expect(subject).not_to be_from_trustee }
    it { expect(subject).not_to be_from_voter }
    it { expect(subject.author_type).to eq(:bulletin_board) }
    it { expect(subject.author_id).to eq("metadecidim") }
    it { expect(subject.authority_id).to eq("decidim-barcelona") }
    it { expect(subject.election_id).to eq("decidim-barcelona.26") }
    it { expect(subject.type).to eq("key_ceremony") }
    it { expect(subject.subtype).to eq("joint_election_key") }
    it { expect(subject.to_s).to eq(message_id) }
  end

  context "when the message was created by a voter" do
    let(:message_id) { "decidim-barcelona.26.vote.cast+v.50ad41624c25e493aa1dc7f4ab32bdc5a3b0b78ecc35b539" }

    it { expect(subject).not_to be_from_authority }
    it { expect(subject).not_to be_from_trustee }
    it { expect(subject).to be_from_voter }
    it { expect(subject.author_type).to eq(:voter) }
    it { expect(subject.author_id).to eq("50ad41624c25e493aa1dc7f4ab32bdc5a3b0b78ecc35b539") }
    it { expect(subject.authority_id).to eq("decidim-barcelona") }
    it { expect(subject.election_id).to eq("decidim-barcelona.26") }
    it { expect(subject.type).to eq("vote") }
    it { expect(subject.subtype).to eq("cast") }
    it { expect(subject.to_s).to eq(message_id) }
  end
end
