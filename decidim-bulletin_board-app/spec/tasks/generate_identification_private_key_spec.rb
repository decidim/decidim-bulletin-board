# frozen_string_literal: true

require "rails_helper"
require "jwk_utils"

RSpec.describe "client:generate_identification_private_key", type: :task do
  subject { task.execute }

  it "generates and prints a private key on JSON format" do
    subject
    check_message_printed('"kty":"RSA"')
    check_message_printed('"dq":')
    check_message_printed("Above is the generated identification private key.")
  end

  context "when running the command several times" do
    subject do
      task.execute
      task.execute
      output.split("\n").select { |line| line.starts_with?("{") } .map { |json| JSON.parse(json) }
    end

    it "changes the output on each execution" do
      key1, key2 = subject
      expect(key1).not_to eq(key2)
    end
  end
end
