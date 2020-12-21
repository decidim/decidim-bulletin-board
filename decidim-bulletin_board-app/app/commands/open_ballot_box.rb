# frozen_string_literal: true

# A command with all the business logic to open the election's ballot box
class OpenBallotBox < Rectify::Command
  include LogEntryCommand

  # Public: Initializes the command.
  #
  # authority - The authority sender of the vote message
  # message_id - The message identifier
  # signed_data - The signed message received
  def initialize(authority, message_id, signed_data)
    @client = @authority = authority
    @message_id = message_id
    @signed_data = signed_data
  end

  # Executes the command. Broadcasts these events:
  #
  # - :ok when everything is valid.
  # - :invalid if the received data wasn't valid.
  #
  # Returns nothing.
  def call
    return broadcast(:invalid, error) unless
      valid_log_entry?("open_ballot_box")

    election.with_lock do
      return broadcast(:invalid, error) unless
        valid_step?(election.ready?) &&
        valid_client?(authority.authority?) &&
        valid_author?(message_identifier.from_authority?) &&
        process_message

      log_entry.election = election
      log_entry.save!
      election.status = :vote
      election.save!
    end

    broadcast(:ok, election)
  end

  private

  attr_accessor :authority
end
