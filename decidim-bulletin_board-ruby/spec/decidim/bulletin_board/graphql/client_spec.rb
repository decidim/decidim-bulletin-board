# frozen_string_literal: true

require "spec_helper"

module Decidim
  module BulletinBoard
    module Graphql
      describe Client do
        subject { described_class.client }

        let(:server) { "https://bb.example.org" }
        let(:api_key) { "IUdVVU0OF2qZgYIeJQnQHZPRloOh4srmXFZPPQx7" }
        let(:client_url) { subject.instance_variable_get(:@url) }
        let(:client_options) { subject.instance_variable_get(:@options) }

        before do
          # Decidim::BulletinBoard::Graphql::Client.class_variable_set(@client, nil)
          Decidim::BulletinBoard.configure do |config|
            config.server = server
            config.api_key = api_key
          end
        end

        it "has a client" do
          expect(subject).not_to be_nil
        end

        it "is a Graphlient client" do
          expect(subject).to be_a Graphlient::Client
        end

        it "uses Bulletin board server as url" do
          expect(server).to eql(client_url)
        end

        it "uses Bulletin board api key as authorization" do
          expect(api_key).to eql(client_options[:headers]["Authorization"])
        end
      end
    end
  end
end
