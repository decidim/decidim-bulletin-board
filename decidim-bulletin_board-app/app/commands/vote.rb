# frozen_string_literal: true

# A command with all the business logic to process a vote message
class Vote < Rectify::Command
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
  # - :processed when everything is valid.
  # - :invalid if the received data wasn't valid.
  #
  # Returns nothing.
  def call
    return broadcast(:invalid, error) unless
      valid_log_entry?("vote")

    return broadcast(:invalid, error) unless
      valid_client?(client.authority?) &&
      valid_step?(election.vote?) &&
      process_message

    election.log_entries << log_entry
    election.with_lock { log_entry.save! }

    broadcast(:ok)
  end

  private

  attr_accessor :authority
end
