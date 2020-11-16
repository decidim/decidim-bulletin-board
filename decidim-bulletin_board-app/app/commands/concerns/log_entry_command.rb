# frozen_string_literal: true

require "active_support/concern"

module LogEntryCommand
  extend ActiveSupport::Concern

  included do
    attr_accessor :client, :signed_data, :log_entry, :error, :response_message
    delegate :voting_scheme, to: :election
    delegate :decoded_data, to: :log_entry

    private

    def build_log_entry(type)
      @log_entry = LogEntry.new(
        signed_data: signed_data,
        log_type: type,
        client: client
      )
    end

    def run_validations
      @error = yield
      @error.blank?
    end

    def valid_log_entry?
      run_validations do
        if decoded_data.blank?
          "Invalid signature"
        elsif decoded_error.present?
          decoded_error
        elsif log_entry_type != log_entry.log_type
          "The message has a wrong type"
        elsif invalid_timestamp?
          "Message is too old to be accepted"
        end
      end
    end

    def valid_step?(valid)
      run_validations do
        "The election is not in the right step" unless valid
      end
    end

    def process_message
      @response_message = voting_scheme.process_message(log_entry.decoded_data)
      election.voting_scheme_state = voting_scheme.backup
      true
    rescue VotingScheme::RejectedMessage => e
      @error = e.message
      false
    end

    def invalid_timestamp?
      iat = decoded_data.dig("iat")
      Time.zone.at(iat) < settings[:iat_expiration_minutes].minutes.ago
    end

    def settings
      Rails.configuration.settings
    end

    def decoded_error
      @decoded_error ||= decoded_data[:error]
    end

    def log_entry_type
      @log_entry_type ||= decoded_data["type"]
    end
  end
end
