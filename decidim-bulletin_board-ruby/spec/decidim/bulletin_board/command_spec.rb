# frozen_string_literal: true

require "spec_helper"
require "wisper/rspec/stub_wisper_publisher"

module Decidim
  module BulletinBoard
    describe Command do
      subject(:instance) { described_class.new }

      include_context "with a configured bulletin board"

      describe ".message_id" do
        subject { instance.message_id(unique_election_id, type_subtype, voter_id) }

        let(:unique_election_id) { "decidim-test-authority.26" }
        let(:type_subtype) { "vote.cast" }
        let(:voter_id) { nil }

        it "returns a message_id for the authority" do
          expect(subject).to eq("decidim-test-authority.26.vote.cast+a.decidim-test-authority")
        end

        context "when including a voter_id" do
          let(:voter_id) { "a-great-voter" }

          it "returns a message_id for the voter" do
            expect(subject).to eq("decidim-test-authority.26.vote.cast+v.a-great-voter")
          end
        end
      end

      describe ".complete_message" do
        subject { instance.complete_message(message_id, message) }

        let(:message_id) { "a.message.id" }
        let(:message) { { a: "message", with: "data" } }

        it "adds the iat and the message_id" do
          expect(subject).to eq(iat: Time.now.to_i, message_id: "a.message.id", a: "message", with: "data")
        end

        context "when the message includes the message_id" do
          let(:message) { { a: "message", with: "data and", message_id: "that should not be used" } }

          it "overrides the message_id" do
            expect(subject).to eq(iat: Time.now.to_i, message_id: "a.message.id", a: "message", with: "data and")
          end
        end
      end

      describe ".sign_message" do
        subject { instance.sign_message(message_id, message) }

        let(:message_id) { "a.message.id" }
        let(:message) { { a: "message", with: "data" } }

        it "uses the private key to sign in the data as JWT" do
          allow(JWT).to receive(:encode)
          subject
          expect(JWT).to have_received(:encode).with({ a: "message", iat: Time.now.to_i, message_id: "a.message.id", with: "data" }, instance_of(OpenSSL::PKey::RSA), "RS256")
        end
      end

      TEST_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEApNgMt8lnPDD3TlWYGhRi\nV1oZkPQmnLdiUzwyb/+35qKD9k+HU86xo0uSgoOUWkBtnvFscq8zNDPAGAlZVoka\nN/z9ksZblSce0LEl8lJa3ICgghg7e8vg/7Lz5dyHSQ3PCLgenyFGcL401aglDde1\nXo4ujdz33Lklc4U9zoyoLUI2/viYmNOU6n5Mn0sJd30FeICMrLD2gX46pGe3MGug\n6groT9EvpKcdOoJHKoO5yGSVaeY5+Bo3gngvlgjlS2mfwjCtF4NYwIQSd2al+p4B\nKnuYAVKRSgr8rYnnjhWfJ4GsCaqiyXNi5NPYRV6gl/cx/1jUcA1rRJqQR32I8c8Q\nbAXm5qNO4URcdaKys9tNcVgXBL1FsSdbrLVVFWen1tfWNfHm+8BjiWCWD79+uk5g\nI0SjC9tWvTzVvswWXI5weNqqVXqpDydr46AsHE2sG40HRCR3UF3LupT+HwXTcYcO\nZr5dJClJIsU3Hrvy4wLssub69YSNR1Jxn+KX2vUc06xY8CNIuSMpfufEq5cZopL6\nO2l1pRsW1FQnF3s078/Y9MaQ1gPyBo0IipLBVUj5IjEIfPuiEk4jxkiUYDeqzf7b\nAvSFckp94yLkRWTs/pEZs7b/ogwRG6WMHjtcaNYe4CufhIm9ekkKDeAWOPRTHfKN\nmohRBh09XuvSjqrx5Z7rqb8CAwEAAQ==\n-----END PUBLIC KEY-----\n"
      describe "#private_key" do
        subject { described_class.private_key }

        it { expect(subject.public_key.to_s).to eq(TEST_PUBLIC_KEY) }
      end

      describe "#authority_slug" do
        subject { described_class.authority_slug }

        it { expect(subject).to eq("decidim-test-authority") }
      end
    end
  end
end
