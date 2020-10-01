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

  def rsa_public_key
    @rsa_public_key ||= OpenSSL::PKey::RSA.new(authority.public_key)
  end

  def json_data
    @json_data ||= JWT.decode signed_data, rsa_public_key, true, algorithm: "RS256"
  rescue JWT::DecodeError
    nil
  end

  def title
    json_data.dig(0, "description", "name", "text", 0, "value")
  end

  def chained_hash
    Digest::SHA256.hexdigest(signed_data)
  end
end
