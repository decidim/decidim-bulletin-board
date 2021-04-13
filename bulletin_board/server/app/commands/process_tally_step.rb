# frozen_string_literal: true

# A command with all the business logic to perform a step of the tally
class ProcessTallyStep < Rectify::Command
  include LogEntryCommand

  # Public: Initializes the command.
  #
  # trustee - The trustee sender of the tally message
  # message_id - The message identifier
  # signed_data - The signed message received
  def initialize(trustee, message_id, signed_data)
    @client = @trustee = trustee
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
      return broadcast(:invalid, error) unless
        valid_client?(client.trustee? && election.trustees.member?(client)) &&
        valid_author?(message_identifier.from_trustee?) &&
        valid_step?(election.tally?) &&
        process_message

      log_entry.election = election
      log_entry.save!
      create_response_log_entries!
      save_election!
    end

    broadcast(:ok)
  end

  private

  def voting_scheme
    @voting_scheme ||= voting_scheme_class.new(election, ValidVotes.new(election))
  end

  attr_accessor :trustee, :response_log_entries

  def save_election!
    if response_log_entries && response_log_entries.any? { |le| le.message_identifier.type == "end_tally" }
      election.tally_ended!
    else
      election.save!
    end
  end
end
