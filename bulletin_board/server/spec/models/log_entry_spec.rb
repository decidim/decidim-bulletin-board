# frozen_string_literal: true

require "rails_helper"

RSpec.describe "LogEntry" do
  subject { log_entry }

  let(:election) { create(:election) }
  let(:log_entry) { build(:log_entry, election: election, message: message) }
  let(:iat) { Time.current.to_i }
  let(:message) do
    {
      message_id: "author.1.type.subtype+a.author",
      content: "the message content",
      data: 123,
      more_data: true,
      iat: iat
    }.with_indifferent_access
  end

  describe "#content" do
    subject { log_entry.content }

    it "returns the message content" do
      expect(subject).to eq("the message content")
    end

    context "when the content is not present in the message" do
      let(:message) do
        {
          data: 123
        }
      end

      it "returns the message content" do
        expect(subject).to be_nil
      end
    end
  end

  describe "#decoded_data" do
    subject { log_entry.decoded_data }

    it "returns the message" do
      expect(subject).to eq(message)
    end
  end

  describe "#previous_hash" do
    subject { log_entry.previous_hash }

    it "returns the chained hash of the last log entry for the election" do
      expect(subject).to eq(election.log_entries.last.chained_hash)
    end

    context "when the election has cached log_entries" do
      let(:last_log_entry) { create(:log_entry, election: election, message: message) }

      before do
        election.log_entries
        last_log_entry
      end

      it "returns the last created log_entry chained hash" do
        expect(subject).to eq(last_log_entry.chained_hash)
      end
    end

    context "when the log entry is the first one for the election" do
      let(:election) { build(:election, unique_id: "1234") }

      it "returns the unique_id of the election" do
        expect(subject).to eq("1234")
      end
    end
  end

  context "when saving the entry" do
    subject { log_entry.save! }

    it "stores the content hash" do
      expect { subject }.to change(log_entry, :content_hash).from(nil)
    end

    it "stores the chained hash" do
      expect { subject }.to change(log_entry, :chained_hash).from(nil)
    end

    it "stores the iat" do
      expect { subject }.to change(log_entry, :iat).from(nil).to(iat)
    end

    it "stores the message_type" do
      expect { subject }.to change(log_entry, :message_type).from(nil).to("type")
    end

    it "stores the message_subtype" do
      expect { subject }.to change(log_entry, :message_subtype).from(nil).to("subtype")
    end

    it "stores the author_unique_id" do
      expect { subject }.to change(log_entry, :author_unique_id).from(nil).to("author")
    end
  end
end
