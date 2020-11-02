# frozen_string_literal: true

require "active_support/concern"

module LogEntryCommand
  extend ActiveSupport::Concern

  def build_log_entry(type)
    @log_entry = LogEntry.new(
      signed_data: signed_data,
      log_type: type,
      client: client
    )
  end

  def log_entry_validations
    if decoded_data.blank?
      "Invalid signature"
    elsif decode_error.present?
      decode_error
    elsif log_entry_type != log_entry.log_type
      "The message has a wrong type"
    elsif !valid_timestamp?
      "Message must get created between now and one hour ago"
    end
  end

  private

  attr_accessor :client, :signed_data, :log_entry
  delegate :decoded_data, to: :log_entry

  def decode_error
    @decode_error ||= decoded_data[:error]
  end

  def log_entry_type
    @log_entry_type ||= decoded_data["type"]
  end

  def valid_timestamp?
    iat = decoded_data.dig("iat")
    Time.zone.at(iat) > 1.hour.ago
  end
end
