# frozen_string_literal: true

# A command with all the business logic to perform a step of the key ceremony
class ProcessKeyCeremonyStep < Rectify::Command
  include LogEntryCommand

  # Public: Initializes the command.
  #
  # trustee - The trustee sender of the key ceremony message
  # message_id - The message identifier
  # signed_data - The signed message received
  def initialize(trustee, message_id, signed_data)
    @client = @trustee = trustee
    @message_id = message_id
    @signed_data = signed_data
    @response_log_entry = nil
  end

  # Executes the command. Broadcasts these events:
  #
  # - :ok when everything is valid.
  # - :invalid if the received data wasn't valid.
  #
  # Returns nothing.
  def call
    return broadcast(:invalid, error) unless
      valid_log_entry?("key_ceremony")

    election.with_lock do
      return broadcast(:invalid, error) unless
        valid_client?(client.trustee?) &&
        valid_author?(message_identifier.from_trustee?) &&
        valid_step?(election.key_ceremony?) &&
        process_message

      log_entry.election = election
      log_entry.save!
      create_response_log_entry!
      election.save!
    end

    broadcast(:ok, [log_entry, response_log_entry].compact)
  end

  private

  attr_accessor :trustee, :response_log_entry

  def create_response_log_entry!
    return unless response_message

    @response_log_entry = LogEntry.create!(
      election: election,
      message_id: response_message["message_id"],
      signed_data: BulletinBoard.sign(response_message),
      bulletin_board: true
    )
  end
end
