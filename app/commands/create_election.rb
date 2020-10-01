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
    json_data = decode_signed_data(@signed_data, @authority.public_key)
    chained_hash = Digest::SHA256.hexdigest(@signed_data)
    @form = ElectionForm.new(title: get_title(json_data), status: "key_ceremony", authority: @authority,
                             signed_data: @signed_data,
                             chained_hash: chained_hash, log_type: "create_election")

    return broadcast(:invalid, "The election form is invalid") if @form.invalid?

    transaction do
      create_election
      create_log_entry
    end
    broadcast(:ok, election)
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique
    broadcast(:invalid, "The data provided was not valid or not unique")
  end

  private

  attr_reader :form, :election

  def decode_signed_data(signed_data, public_key)
    rsa_public_key = OpenSSL::PKey::RSA.new(public_key)
    JWT.decode signed_data, rsa_public_key, false, algorithm: "RS256"
  end

  def get_title(json_data)
    json_data[0]["description"]["name"]["text"][0]["value"]
  end

  def create_election
    election_attributes = {
      title: form.title,
      status: form.status,
      authority: form.authority
    }
    @election = Election.create(election_attributes)
  end

  def create_log_entry
    log_entry_attributes = {
      signed_data: form.signed_data,
      chained_hash: form.chained_hash,
      log_type: form.log_type,
      election: @election,
      client_id: form.authority.id
    }
    LogEntry.create(log_entry_attributes)
  end
end
