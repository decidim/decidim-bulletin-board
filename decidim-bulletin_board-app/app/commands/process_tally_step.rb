# frozen_string_literal: true

# A command with all the business logic to perform a step of the tally
class ProcessTallyStep < Rectify::Command
  include LogEntryCommand

  # Public: Initializes the command.
  #
  # client - The authority or trustee sender of the tally message
  # message_id - The message identifier
  # signed_data - The signed message received
  def initialize(client, message_id, signed_data)
    @client = client
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
      valid_log_entry?("tally")

    election.with_lock do
      return broadcast(:invalid, error) unless valid?

      log_entry.election = election
      log_entry.save!
      create_response_log_entry!
      election.save!
    end

    broadcast(:ok)
  end

  private

  def valid?
    valid_client?(client.authority? && election.authority == client || client.trustee? && election.trustees.member?(client)) &&
      valid_author?(message_identifier.from_authority? || message_identifier.from_trustee?) &&
      valid_step?(election.tally?) &&
      process_message
  end

  def voting_scheme
    @voting_scheme ||= voting_scheme_class.new(election, ElectionUniqueVotes.new(election))
  end

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
