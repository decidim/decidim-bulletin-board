# frozen_string_literal: true

require "rails_helper"

RSpec.describe "BulletinBoard" do
  subject { BulletinBoard }

  let!(:private_key) { Decidim::BulletinBoard::JwkUtils.import_private_key(Rails.application.secrets.bulletin_board_private_key) }

  before do
    subject
  end

  it "sets id as primary key" do
    expect(subject.primary_key).to eq(:id)
  end

  it "sets 0 as id default" do
    expect(subject.id).to eq(0)
  end

  it "is readonly by default" do
    expect(subject).to be_readonly
  end

  it "is persisted by default" do
    expect(subject).to be_persisted
  end

  it "sets polymorphic_name to Bulletin Board" do
    expect(subject.polymorphic_name).to eq("Bulletin Board")
  end

  it "is not destroyed by default" do
    expect(subject).not_to be_destroyed
  end

  it "is not a new record by default" do
    expect(subject).not_to be_new_record
  end

  it "has a type of BulletinBoard" do
    expect(subject.type).to eq("BulletinBoard")
  end

  it "has a public key" do
    expect(subject.public_key).to eq(private_key&.export)
  end

  it "has a name of Bulletin Board" do
    expect(subject.name).to eq("Bulletin Board")
  end

  it "is a bulletin_board" do
    expect(subject).to be_bulletin_board
  end

  it "'s slug is the name parameterized" do
    expect(subject.slug).to eq("bulletin-board")
  end

  it "has an alias for slug called unique_id" do
    expect(subject.unique_id).to eq(subject.slug)
  end

  it "is configered when private key is present" do
    expect(subject.configured?).to eq(true)
  end
end
