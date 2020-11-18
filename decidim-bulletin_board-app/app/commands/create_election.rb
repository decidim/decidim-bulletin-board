# frozen_string_literal: true

# A command with all the business logic to create a new election
class CreateElection < Rectify::Command
  include LogEntryCommand

  # Public: Initializes the command.
  #
  # authority - The authority that requests the creation of the election
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
  # - :invalid if the form wasn't valid and we couldn't proceed.
  #
  # Returns nothing.
  def call
    build_log_entry

    return broadcast(:invalid, error) unless
      valid_log_entry?("create_election") &&
      valid_step?(election.new_record?) &&
      valid_election? &&
      valid_questions? &&
      process_message

    transaction do
      election.save!
      log_entry.save!
      create_trustees
    end

    broadcast(:ok, election)
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique
    broadcast(:invalid, "The data provided was not valid or not unique")
  end

  private

  attr_reader :authority

  def election
    @election ||= log_entry.election = Election.new(
      unique_id: message_identifier.election_id,
      title: title,
      status: "key_ceremony",
      authority: authority,
      log_entries: [log_entry]
    )
  end

  def create_trustees
    trustees.each do |trustee|
      find_or_create_trustee(trustee).election_trustees.create!(election: election)
    end
  end

  def find_or_create_trustee(trustee)
    Trustee.where(name: trustee["name"]).or(Trustee.where(public_key: trustee["public_key"])).first ||
      Trustee.create!(
        name: trustee["name"],
        public_key: trustee["public_key"]
      )
  end

  def trustees
    @trustees ||= decoded_data["trustees"]
  end

  def title
    @title ||= decoded_data.dig("description", "name", "text", 0, "value")
  end

  def start_date
    return @start_date if defined?(@start_date)

    @start_date ||= Time.zone.parse(decoded_data.dig("description", "start_date") || "")
  end

  def end_date
    return @end_date if defined?(@end_date)

    @end_date ||= Time.zone.parse(decoded_data.dig("description", "end_date") || "")
  end

  def questions
    @questions ||= decoded_data.dig("description", "contests")
  end

  def valid_election?
    run_validations do
      if election.voting_scheme_class.blank?
        "A valid Voting Scheme must be specified"
      elsif title.blank?
        "Missing title"
      elsif start_date.after?(end_date)
        "Starting date cannot be after the end date"
      elsif start_date.before?(settings.create_election[:hours_before].hours.from_now)
        "Election should start at least in #{settings.create_election[:hours_before]} hours from now."
      elsif questions.blank?
        "There must be at least 1 question for the election"
      end
    end
  end

  def valid_questions?
    questions.each do |quest|
      number_elected = quest.dig("number_elected")
      ballot_selections = quest.dig("ballot_selections")
      return false unless run_validations do
        if number_elected.blank?
          "There must be specified the number of answers to be selected"
        elsif ballot_selections.blank? || ballot_selections.size <= 1
          "There must be at least 2 answers for each question"
        elsif number_elected.to_i > ballot_selections.size
          "The number of possible answers cannot be greater than the number of answers offered"
        end
      end
    end
    true
  end
end
