# frozen_string_literal: true

require "spec_helper"
require "wisper/rspec/stub_wisper_publisher"

module Decidim
  module BulletinBoard
    describe Command do
      subject { described_class.new }

      include_context "with a configured bulletin board"

      describe ".complete_message" do
      end

      describe ".message_id" do

      end

      describe ".sign_message" do
        it "uses the private key to sign in the data as JWT" do
          allow(JWT).to receive(:encode)
          subject.sign_message("a message_id", { some: "data" })
          expect(JWT).to have_received(:encode).with({ iat: Time.now.to_i, message_id: "a message_id", some: "data" }, instance_of(OpenSSL::PKey::RSA), "RS256")
        end
      end

      describe "#private_key" do
      end

      describe "#authority_slug" do

      end
    end
  end
end
