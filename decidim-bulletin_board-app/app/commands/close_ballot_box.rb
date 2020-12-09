# frozen_string_literal: true

# A command with all the business logic to close the election's ballot box
class CloseBallotBox < Rectify::Command
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
      valid_log_entry?("close_ballot_box")

    election.with_lock do
      return broadcast(:invalid, error) unless
        valid_step?(election.vote?) &&
        valid_client?(authority.authority?) &&
        valid_author?(message_identifier.from_authority?) &&
        process_message

      election.log_entries << log_entry
      log_entry.save!
      election.status = :tally
      election.save!
    end

    broadcast(:ok, election)
  end

  private

  attr_accessor :authority
end
