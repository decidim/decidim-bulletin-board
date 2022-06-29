# frozen_string_literal: true

# A command with all the business logic to start the tally proceess
class StartTally < Rectify::Command
  include LogEntryCommand

  # Public: Initializes the command.
  #
  # authority - The authority sender of the start tally request
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
      valid_log_entry?("start_tally")
    return broadcast(:invalid, error) unless
      valid_client?(authority.authority? && election.authority == authority) &&
      valid_author?(message_identifier.from_authority?) &&
      valid_step?(election.vote_ended?) &&
      process_message

    election.with_lock do
      log_entry.election = election
      log_entry.save!
      create_response_log_entries!
      election.tally_started!
    end

    broadcast(:ok)
  end

  private

  attr_accessor :authority

  def voting_scheme
    @voting_scheme ||= voting_scheme_class.new(election, ValidVotes.new(election))
  end
end
