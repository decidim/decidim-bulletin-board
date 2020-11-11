# frozen_string_literal: true

# A command with all the business logic to perform a step of the key ceremony
class ProcessKeyCeremonyStep < Rectify::Command
  include LogEntryCommand

  # Public: Initializes the command.
  #
  # trustee - The trustee sender of the key ceremony message
  # signed_data - The signed message received
  def initialize(trustee, signed_data)
    @client = @trustee = trustee
    @signed_data = signed_data
  end

  # Executes the command. Broadcasts these events:
  #
  # - :election with the election model referred by the message
  # - :processed when everything is valid.
  # - :invalid if the received data wasn't valid.
  #
  # Returns nothing.
  def call
    build_log_entry "key_ceremony"

    return broadcast(:invalid, invalid_message) if invalid_format?

    election.with_lock do
      broadcast(:election, election)

      return broadcast(:invalid, invalid_message) if invalid_content?

      election.log_entries << log_entry
      log_entry.save!
      create_response_log_entry!
      election.save!
    end

    broadcast(:processed)
  end

  private

  attr_accessor :trustee, :invalid_message, :response_message
  delegate :voting_scheme, to: :election

  def invalid_format?
    @invalid_message ||= log_entry_validations
    invalid_message.present?
  end

  def invalid_content?
    @invalid_message ||= if !election.key_ceremony?
                           "The election is not in the Key ceremony step"
                         elsif !process_message
                           "The voting scheme rejected the message"
                         end
    invalid_message.present?
  end

  def process_message
    @response_message = voting_scheme.process_message(log_entry.decoded_data)
    voting_scheme.save
    true
  rescue VotingScheme::RejectedMessage
    false
  end

  def create_response_log_entry!
    return unless response_message

    LogEntry.create!(
      election: election,
      signed_data: BulletinBoard.sign(response_message),
      log_type: :key_ceremony,
      bulletin_board: true
    )
  end

  def election
    @election ||= Election.find_by(unique_id: decoded_data["election_id"])
  end
end
