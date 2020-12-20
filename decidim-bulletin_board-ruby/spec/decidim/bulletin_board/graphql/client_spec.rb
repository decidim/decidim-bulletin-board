# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Graphql
      describe Client do
        subject { described_class.client }

        it "has a client" do
          expect(subject).not_to be_nil
        end

        it "is a Graphlient client" do
          expect(subject).to be_a Graphlient::Client
        end

        it "has a schema" do
          expect(subject.schema).to be_a Graphlient::Schema
        end
      end
    end
  end
end
