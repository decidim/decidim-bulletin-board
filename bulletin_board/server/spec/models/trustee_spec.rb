# frozen_string_literal: true

require "rails_helper"

RSpec.describe Trustee do
  subject { trustee }

  let(:trustee) { build(:trustee) }

  it { is_expected.to be_valid }

  describe "#trustee?" do
    it "returns true" do
      expect(subject.trustee?).to be true
    end
  end

  describe "#bulletin_board?" do
    it "returns false" do
      expect(subject.bulletin_board?).to be false
    end
  end

  describe "#authority?" do
    it "returns false" do
      expect(subject.authority?).to be false
    end
  end

  context "when saving the trustee" do
    subject { trustee.save }

    it "calculates the key thumbprint" do
      expect { subject }.to change(trustee, :public_key_thumbprint).from(nil)
    end
  end
end
