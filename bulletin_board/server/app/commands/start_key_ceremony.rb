# frozen_string_literal: true

# A command with all the business logic to start the key ceremony proceess
class StartKeyCeremony < Rectify::Command
  include LogEntryCommand

  # Public: Initializes the command.
  #
  # authority - The authority sender of the start key ceremony request
  # message_id - The message identifier
  # signed_data - The signed message received
  def initialize(authority, message_id, signed_data)
    @client = @authority = authority
    @message_id = message_id
    @signed_data = signed_data
  end

  # Executes the command. Broadcasts these events:
  #
  # - :processed when everything is valid.
  # - :invalid if the received data wasn't valid.
  #
  # Returns nothing.
  def call
    return broadcast(:invalid, error) unless
      valid_log_entry?("start_key_ceremony")
    return broadcast(:invalid, error) unless
      valid_client?(authority.authority? && election.authority == authority) &&
      valid_author?(message_identifier.from_authority?) &&
      valid_step?(election.created?)

    election.with_lock do
      return broadcast(:invalid, error) unless process_message # rubocop:disable Rails/TransactionExitStatement

      log_entry.election = election
      log_entry.save!
      create_response_log_entries!
      election.key_ceremony!
    end

    broadcast(:ok)
  end

  private

  attr_accessor :authority

  def create_response_log_entries!
    return unless response_messages

    @response_log_entries = response_messages.map do |response_message|
      LogEntry.create!(
        election:,
        message_id: response_message["message_id"],
        signed_data: BulletinBoard.sign(response_message),
        bulletin_board: true
      )
    end
  end
end
