# frozen_string_literal: true

# A command with all the business logic to create a new election
class CreateElection < Rectify::Command
  # Public: Initializes the command.
  #
  # form - A form object with the params.
  def initialize(authority, signed_data)
    @authority = authority
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
    build_election
    broadcast(:invalid, invalid_message) if invalid?

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

  attr_reader :form, :election, :log_entry, :authority, :signed_data, :invalid_message
  delegate :decoded_data, to: :log_entry

  def build_election
    election_attributes = {
      title: title,
      status: "key_ceremony",
      authority: authority
    }
    @election = Election.new(election_attributes)
    log_entry.election = election
    election.log_entries = [log_entry]
  end

  def build_log_entry
    log_entry_attributes = {
      signed_data: signed_data,
      chained_hash: chained_hash,
      log_type: "create_election",
      client_id: authority.id
    }
    @log_entry = LogEntry.new(log_entry_attributes)
  end

  def invalid?
    @invalid_message = if decoded_data.blank?
                         "Invalid signature"
                       elsif election.voting_scheme_class.blank?
                         "A valid Voting Scheme must be specified"
                       elsif title.blank?
                         "Missing title"
                       elsif start_date.after?(end_date)
                         "Starting date cannot be after the end date"
                       elsif start_date.before?(Time.current + 2 * 60 * 60)
                         "Starting date cannot be before the current date plus two hours"
                       elsif questions.blank? || questions.empty?
                         "There must be at least 1 question for the election"
                      #  elsif !valid_timestamp?
                      #    "Message must get created between now and one hour ago"
                       end

    @invalid_message ||= answers_validations
    @invalid_message ||= election.voting_scheme.validate_election
    @invalid_message.present?
  end

  def valid_timestamp?
    iat = decoded_data.dig("iat")
    Time.zone.at(iat).between?(1.hour.ago, 5.minutes.from_now)
  end

  def create_trustees
    trustees.each do |trustee|
      create_trustee(trustee)
    end
  end

  def create_trustee(trustee)
    trustee_attributes = {
      name: trustee_name(trustee),
      public_key: trustee_public_key(trustee)
    }
    t = Trustee.where(name: trustee_name(trustee)).or(Trustee.where(public_key: trustee_public_key(trustee))).first
    t = Trustee.create!(trustee_attributes) if t.blank?
    t.elections_trustees.create!(election: election)
  end

  def trustees
    decoded_data.dig("trustees")
  end

  def trustee_name(trustee)
    trustee.dig("name")
  end

  def trustee_public_key(trustee)
    trustee.dig("public_key")
  end

  def title
    decoded_data.dig("description", "name", "text", 0, "value")
  end

  def start_date
    start_date = decoded_data.dig("description", "start_date")
    Time.zone.parse(start_date) if start_date.present?
  end

  def end_date
    end_date = decoded_data.dig("description", "end_date")
    Time.zone.parse(end_date) if end_date.present?
  end

  def questions
    decoded_data.dig("description", "contests")
  end

  def answers_validations
    questions.each do |quest|
      number_elected = quest.dig("number_elected")
      ballot_selections = quest.dig("ballot_selections")
      return "There must be specified the number of answers to be selected" if number_elected.blank?
      return "There must be at least 2 answers for each question" if ballot_selections.blank? || ballot_selections.size <= 1
      return "The number of possible answers cannot be greater than the number of answers offered" if number_elected.to_i > ballot_selections.size
    end
    nil
  end

  def chained_hash
    Digest::SHA256.hexdigest(signed_data)
  end
end
