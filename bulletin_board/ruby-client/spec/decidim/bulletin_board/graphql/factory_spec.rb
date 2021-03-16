# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Graphql
      describe Factory do
        subject { described_class.client_for(settings) }

        let(:settings) { double(bulletin_board_server: "http://localhost:8000", authority_api_key: "123") }

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
