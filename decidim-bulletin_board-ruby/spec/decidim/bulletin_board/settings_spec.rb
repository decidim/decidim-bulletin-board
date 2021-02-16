# frozen_string_literal: true

require "spec_helper"
module Decidim
  module BulletinBoard
    describe Settings do
      subject(:instance) { described_class.new(config) }

      include_context "with a configured bulletin board"

      AUTHORITY_PUBLIC_KEY = { kty: "RSA", n: "pNgMt8lnPDD3TlWYGhRiV1oZkPQmnLdiUzwyb_-35qKD9k-HU86xo0uSgoOUWkBtnvFscq8zNDPAGAlZVokaN_z9ksZblSce0LEl8lJa3ICgghg7e8vg_7Lz5dyHSQ3PCLgenyFGcL401aglDde1Xo4ujdz33Lklc4U9zoyoLUI2_viYmNOU6n5Mn0sJd30FeICMrLD2gX46pGe3MGug6groT9EvpKcdOoJHKoO5yGSVaeY5-Bo3gngvlgjlS2mfwjCtF4NYwIQSd2al-p4BKnuYAVKRSgr8rYnnjhWfJ4GsCaqiyXNi5NPYRV6gl_cx_1jUcA1rRJqQR32I8c8QbAXm5qNO4URcdaKys9tNcVgXBL1FsSdbrLVVFWen1tfWNfHm-8BjiWCWD79-uk5gI0SjC9tWvTzVvswWXI5weNqqVXqpDydr46AsHE2sG40HRCR3UF3LupT-HwXTcYcOZr5dJClJIsU3Hrvy4wLssub69YSNR1Jxn-KX2vUc06xY8CNIuSMpfufEq5cZopL6O2l1pRsW1FQnF3s078_Y9MaQ1gPyBo0IipLBVUj5IjEIfPuiEk4jxkiUYDeqzf7bAvSFckp94yLkRWTs_pEZs7b_ogwRG6WMHjtcaNYe4CufhIm9ekkKDeAWOPRTHfKNmohRBh09XuvSjqrx5Z7rqb8", e: "AQAB", kid: "b8dba1459df956d60107690c34fa490db681eac4f73ffaf6e4055728c02ddc8e" }.freeze

      it { is_expected.to be_configured }

      context "when bulletin_board_server is not present" do
        let(:bulletin_board_server) { "" }

        it { is_expected.not_to be_configured }
      end

      context "when bulletin_board_public_key is not present" do
        let(:bulletin_board_public_key) { "" }

        it { is_expected.not_to be_configured }
      end

      context "when private key is not present" do
        let(:authority_private_key) { "" }

        it { is_expected.not_to be_configured }

        it "doesn't have an identification public key" do
          expect(subject.authority_public_key).to be_nil
        end
      end

      context "when authority_api_key is not present" do
        let(:authority_api_key) { "" }

        it { is_expected.not_to be_configured }
      end

      describe ".authority_public_key" do
        subject { instance.authority_public_key }

        it { expect(subject.to_s).to eq(AUTHORITY_PUBLIC_KEY.to_s) }
      end

      describe ".authority_slug" do
        subject { instance.authority_slug }

        it { expect(subject).to eq("decidim-test-authority") }
      end

      describe ".bulletin_board_public_key_rsa" do
        subject { instance.bulletin_board_public_key_rsa }

        it { expect(subject).to be_a OpenSSL::PKey::RSA }
      end
    end
  end
end
