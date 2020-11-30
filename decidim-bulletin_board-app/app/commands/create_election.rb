# frozen_string_literal: true

# A command with all the business logic to create a new election
class CreateElection < Rectify::Command
  include LogEntryCommand

  # Public: Initializes the command.
  #
  # authority - The authority that requests the creation of the election
  # signed_data - The signed message received
  def initialize(authority, signed_data)
    @client = @authority = authority
    @signed_data = signed_data
  end

  # Executes the command. Broadcasts these events:
  #
  # - :ok when everything is valid.
  # - :invalid if the form wasn't valid and we couldn't proceed.
  #
  # Returns nothing.
  def call
    build_log_entry "create_election"
    build_election
    return broadcast(:invalid, invalid_message) if invalid?

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

  attr_reader :authority, :invalid_message, :election

  def build_election
    election_attributes = {
      unique_id: election_id,
      title: title,
      status: "key_ceremony",
      authority: authority
    }
    @election = Election.new(election_attributes)
    log_entry.election = election
    election.log_entries = [log_entry]
  end

  def invalid?
    @invalid_message ||= log_entry_validations || election_validations || questions_validations || election.voting_scheme.validate_election
    @invalid_message.present?
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
        public_key: JSON.parse(trustee["public_key"])
      )
  end

  def trustees
    @trustees ||= decoded_data["trustees"]
  end

  def election_id
    @election_id ||= decoded_data["election_id"]
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

  def election_validations
    @election_validations = if decoded_data.blank?
                              "Invalid signature"
                            elsif decoded_error.present?
                              decoded_error
                            elsif election.voting_scheme_class.blank?
                              "A valid Voting Scheme must be specified"
                            elsif title.blank?
                              "Missing title"
                            elsif start_date.after?(end_date)
                              "Starting date cannot be after the end date"
                            elsif start_date.before?(settings.create_election[:hours_before].hours.from_now)
                              "Election should start at least in #{settings.create_election[:hours_before]} hours from now."
                            elsif questions.blank?
                              "There must be at least 1 question for the election"
                            elsif !valid_timestamp?
                              "Message must get created between now and one hour ago"
                            end
  end

  def questions_validations
    @questions_validations ||= questions.map do |quest|
      number_elected = quest.dig("number_elected")
      ballot_selections = quest.dig("ballot_selections")
      if number_elected.blank?
        "There must be specified the number of answers to be selected"
      elsif ballot_selections.blank? || ballot_selections.size <= 1
        "There must be at least 2 answers for each question"
      elsif number_elected.to_i > ballot_selections.size
        "The number of possible answers cannot be greater than the number of answers offered"
      end
    end.compact.first
  end
end
