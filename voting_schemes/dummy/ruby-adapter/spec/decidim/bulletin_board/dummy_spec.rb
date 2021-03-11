# frozen_string_literal: true

RSpec.describe Decidim::BulletinBoard::Dummy do
  it "has a version number" do
    expect(Decidim::BulletinBoard::Dummy::VERSION).not_to be_nil
  end
end
