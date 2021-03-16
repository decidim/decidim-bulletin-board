# frozen_string_literal: true

require "jsonl"
require "byebug"

class ElectionguardTestData
  class Messages
    include Enumerable

    def initialize(enumerable)
      @enumerable = enumerable
    end

    def each(&block)
      @enumerable.each(&block)
    end

    def of_type(type)
      Messages.new(filter { |m| m["message_type"] == type })
    end

    def by(wrapper)
      Messages.new(filter { |m| m["wrapper"] == wrapper })
    end

    def inputs
      map { |m| m["in"] }
    end

    def outputs
      flat_map { |m| m["out"] }
    end

    def input_contents
      inputs.map { |m| m["content"] && JSON.parse(m["content"]) }
    end

    def output_contents
      outputs.map { |m| m["content"] && JSON.parse(m["content"]) }
    end
  end

  FILE = File.join(File.dirname(__FILE__), "electionguard_test_data.jsonl")
  @messages = JSONL.parse(File.read(FILE))

  def self.messages
    Messages.new(@messages)
  end

  def self.election_steps
    messages.map { |x| x["message_type"].to_sym }.uniq
  end

  def self.election_title
    messages.of_type("create_election").inputs.first
            .dig("description", "name", "text", 0, "value")
  end

  def self.create_election_message
    messages.of_type("create_election").inputs.first
  end

  def self.trustee_ids
    messages.by("Trustee").of_type("start_key_ceremony").output_contents.map { |x| x["public_key_set"]["owner_id"] }.uniq.sort
  end

  def self.trustee_election_keys
    messages.by("Trustee").of_type("start_key_ceremony").outputs.sort_by { |x| JSON.parse(x["content"])["public_key_set"]["owner_id"] }
  end

  def self.trustee_partial_election_keys
    messages.by("Trustee").of_type("key_ceremony.trustee_election_keys").outputs.sort_by { |x| JSON.parse(x["content"])["guardian_id"] }
  end

  def self.trustee_verifications
    messages.by("Trustee").of_type("key_ceremony.trustee_partial_election_keys").outputs.sort_by { |x| JSON.parse(x["content"])["guardian_id"] }
  end

  def self.end_key_ceremony
    messages.by("BulletinBoard").of_type("key_ceremony.trustee_verification").outputs.last
  end
end
