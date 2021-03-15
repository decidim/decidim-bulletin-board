# frozen_string_literal: true

require "rails_helper"

RSpec.describe Authority do
  subject { authority }

  let(:authority) { build(:authority) }

  it { is_expected.to be_valid }

  describe "#authority?" do
    it "returns true" do
      expect(subject.authority?).to be true
    end
  end

  describe "#bulletin_board?" do
    it "returns false" do
      expect(subject.bulletin_board?).to be false
    end
  end

  describe "#trustee?" do
    it "returns false" do
      expect(subject.trustee?).to be false
    end
  end

  context "when saving the authority" do
    subject { authority.save }

    it "calculates the key thumbprint" do
      expect { subject }.to change(authority, :public_key_thumbprint).from(nil)
    end
  end
end
