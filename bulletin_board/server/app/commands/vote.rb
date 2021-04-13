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
      valid_client?(client.authority? && election.authority == authority) &&
      valid_author?(message_identifier.from_voter?, ignore_author_id: true) &&
      valid_step?(election.vote?) &&
      valid_vote? &&
      (in_person_vote? || process_message)

    log_entry.election = election
    election.with_lock { log_entry.save! }

    broadcast(:ok)
  end

  private

  attr_accessor :authority

  def valid_vote?
    run_validations do
      if cant_revote?
        "Can't cast a vote after voting in person."
      elsif in_person_vote? && !valid_polling_station?
        "Invalid polling station identifier."
      end
    end
  end

  def cant_revote?
    (
      ElectionInPersonVotes.new(election) |
      ElectionVoterVote.new(election, message_identifier.author_id)
    ).exists?
  end

  def in_person_vote?
    return @in_person_vote if defined?(@in_person_vote)

    @in_person_vote = message_identifier.subtype == "in_person"
  end

  def valid_polling_station?
    election.polling_stations.include?(decoded_data[:polling_station_id])
  end
end
