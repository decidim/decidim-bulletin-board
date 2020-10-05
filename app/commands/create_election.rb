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
    broadcast(:invalid, invalid_message) if invalid?

    transaction do
      create_election
      create_trustees
      create_log_entry
    end
    broadcast(:ok, election)
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique
    broadcast(:invalid, "The data provided was not valid or not unique")
  end

  private

  attr_reader :form, :election, :authority, :signed_data, :invalid_message

  def invalid?
    (@invalid_message = if json_data.blank?
                          "Invalid signature"
                        elsif title.blank?
                          "Missing title"
                        elsif start_date.after?(end_date)
                          "Starting date cannot be after the end date"
                        elsif start_date.before?(Time.current)
                          "Starting date cannot be before the current date"
                        elsif questions.blank? || questions.empty?
                          "There must be at least 1 question for the election"
                        else
                          answers_validations
                        end).present?
  end

  def create_election
    election_attributes = {
      title: title,
      status: "key_ceremony",
      authority: authority
    }
    @election = Election.create!(election_attributes)
  end

  def create_log_entry
    log_entry_attributes = {
      signed_data: signed_data,
      chained_hash: chained_hash,
      log_type: "create_election",
      election: election,
      client_id: authority.id
    }
    LogEntry.create!(log_entry_attributes)
  end

  def create_trustees
    trustees.each do |trustee|
      create_trustee(trustee)
    end
  end

  def create_trustee(trustee)
    trustee_attributes = {
      name: trustee_name(trustee),
      public_key: trustee_public_key(trustee),
      api_key: trustee_public_key(trustee)
    }
    t = Trustee.create!(trustee_attributes)
    t.elections_trustees.create!(election: election)
  end

  def rsa_public_key
    @rsa_public_key ||= OpenSSL::PKey::RSA.new(authority.public_key)
  end

  def json_data
    @json_data ||= JWT.decode signed_data, rsa_public_key, true, algorithm: "RS256"
  rescue JWT::DecodeError
    nil
  end

  def trustees
    json_data.dig(0, "trustees")
  end

  def trustee_name(trustee)
    trustee.dig("name")
  end

  def trustee_public_key(trustee)
    trustee.dig("public_key")
  end

  def title
    json_data.dig(0, "description", "name", "text", 0, "value")
  end

  def start_date
    start_date = json_data.dig(0, "description", "start_date")
    Time.zone.parse(start_date) if start_date.present?
  end

  def end_date
    end_date = json_data.dig(0, "description", "end_date")
    Time.zone.parse(end_date) if end_date.present?
  end

  def questions
    json_data.dig(0, "description", "contests")
  end

  def answers_validations
    questions.each do |quest|
      number_elected = quest.dig("number_elected")
      ballot_selections = quest.dig("ballot_selections")
      return "There must be specified the number of answers to be selected" if number_elected.blank?
      return "There must be at least 2 answers for each question" if ballot_selections.blank? || ballot_selections.size <= 1
      return "The number of possible answers cannot be greater than the number of answers offered" if number_elected.to_i > ballot_selections.size
    end
    ""
  end

  def chained_hash
    Digest::SHA256.hexdigest(signed_data)
  end
end
