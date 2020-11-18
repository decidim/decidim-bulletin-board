# frozen_string_literal: true

require "active_support/concern"

module LogEntryCommand
  extend ActiveSupport::Concern

  included do
    attr_accessor :client, :signed_data, :log_entry
    delegate :decoded_data, to: :log_entry
  end

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
    elsif decoded_error.present?
      decoded_error
    elsif log_entry_type != log_entry.log_type
      "The message has a wrong type"
    elsif !valid_timestamp?
      "Message is too old to be accepted"
    end
  end

  private

  def settings
    Rails.configuration.settings
  end

  def decoded_error
    @decoded_error ||= decoded_data[:error]
  end

  def log_entry_type
    @log_entry_type ||= decoded_data["type"]
  end

  def valid_timestamp?
    iat = decoded_data.dig("iat")
    Time.zone.at(iat) > settings[:iat_expiration_minutes].minutes.ago
  end
end
