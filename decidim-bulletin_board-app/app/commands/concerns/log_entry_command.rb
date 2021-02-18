# frozen_string_literal: true

require "active_support/concern"

module LogEntryCommand
  extend ActiveSupport::Concern

  included do
    include HasMessageIdentifier

    attr_accessor :client, :signed_data, :error, :response_message

    delegate :decoded_data, to: :log_entry

    private

    def log_entry
      @log_entry ||= LogEntry.new(
        message_id: message_id,
        signed_data: signed_data,
        client: client
      )
    end

    def run_validations
      @error = yield
      @error.blank?
    end

    def valid_log_entry?(type)
      run_validations do
        if decoded_data.blank?
          "Invalid signature"
        elsif decoded_error.present?
          decoded_error
        elsif message_id != decoded_data[:message_id]
          "The message identifier given doesn't match the signed data"
        elsif message_identifier.type != type
          "The message is not valid for this endpoint"
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

    def valid_client?(valid)
      run_validations do
        "Invalid client" unless valid
      end
    end

    def valid_author?(valid, ignore_author_id: false)
      run_validations do
        "Invalid message author" unless valid && (message_identifier.author_id == client.unique_id || ignore_author_id)
      end
    end

    def process_message
      @response_message = voting_scheme.process_message(message_identifier, log_entry.decoded_data.deep_dup)
      election.voting_scheme_state = voting_scheme.backup
      true
    rescue VotingScheme::RejectedMessage => e
      @error = e.message
      false
    end

    def create_response_log_entry!
      return unless response_message

      @response_log_entry = LogEntry.create!(
        election: election,
        message_id: Decidim::BulletinBoard::MessageIdentifier.format(election.unique_id, response_message["message_type"], :bulletin_board, BulletinBoard.unique_id),
        signed_data: BulletinBoard.sign(response_message.to_h.merge(iat: Time.current.to_i)),
        bulletin_board: true
      )
    end

    def invalid_timestamp?
      iat = decoded_data[:iat]
      Time.zone.at(iat) < settings[:iat_expiration_minutes].minutes.ago
    end

    def settings
      Rails.configuration.settings
    end

    def decoded_error
      @decoded_error ||= decoded_data[:error]
    end

    def voting_scheme
      @voting_scheme ||= voting_scheme_class.new(election)
    end

    def voting_scheme_class
      VotingScheme.from_name(election.voting_scheme_name)
    end
  end
end
