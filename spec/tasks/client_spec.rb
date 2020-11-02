# frozen_string_literal: true

require "rails_helper"
require "jwk_utils"

RSpec.describe "client:add_authority", type: :task do
  subject { task.execute(name: name, public_key: public_key) }

  let(:name) { authority.name }
  let(:public_key) { authority.public_key.to_json }
  let(:authority) { build(:authority, private_key: private_key) }
  let(:private_key) { generate(:private_key) }

  it "creates a new authority" do
    subject
    check_message_printed("Authority '#{authority.name}' successfuly added!")
    check_message_printed(Authority.last.api_key)
  end

  context "when authority's public key already exists" do
    let(:authority) { create(:authority, private_key: private_key) }
    let(:name) { authority.name + "2" }

    it "detects the existing public key" do
      subject
      check_message_printed("The authority already exists!")
      check_message_printed(authority.api_key)
    end
  end

  context "when authority's name already exists" do
    let(:authority) { create(:authority, private_key: private_key) }
    let(:public_key) { generate(:private_key).export.to_json }

    it "detects the existing name" do
      subject
      check_message_printed("The authority already exists!")
      check_message_printed(authority.api_key)
    end
  end

  context "when receives a private key" do
    let(:public_key) { JwkUtils.private_export(private_key).to_json }

    it "detects the private key and warns the user" do
      subject
      check_message_printed("WARNING! The authority sent you their private key!")
      check_message_printed("The authority needs to generate another pair of keys and then send only the public key.")
    end
  end

  context "when working with PEM format" do
    let(:public_key) { private_key.public_key.to_s.gsub("\n", ".") }

    it "creates a new authority" do
      subject
      check_message_printed("Authority '#{authority.name}' successfuly added!")
      check_message_printed(Authority.last.api_key)
    end

    context "when authority's public key already exists" do
      let(:authority) { create(:authority, private_key: private_key) }
      let(:name) { authority.name + "2" }

      it "detects the existing public key" do
        subject
        check_message_printed("The authority already exists!")
        check_message_printed(authority.api_key)
      end
    end

    context "when authority's name already exists" do
      let(:authority) { create(:authority, private_key: private_key) }
      let(:public_key) { generate(:private_key).public_key.to_s.gsub("\n", ".") }

      it "detects the existing name" do
        subject
        check_message_printed("The authority already exists!")
        check_message_printed(authority.api_key)
      end
    end

    context "when receives a private key" do
      let(:public_key) { private_key.keypair.to_s }

      it "detects the private key and warns the user" do
        subject
        check_message_printed("WARNING! The authority sent you their private key!")
        check_message_printed("The authority needs to generate another pair of keys and then send only the public key.")
      end
    end
  end
end
