# frozen_string_literal: true

# A command with all the business logic to create a new election
class CreateElection < Rectify::Command
  # Public: Initializes the command.
  #
  # form - A form object with the params.
  def initialize(form)
    @form = form
  end

  # Executes the command. Broadcasts these events:
  #
  # - :ok when everything is valid.
  # - :invalid if the form wasn't valid and we couldn't proceed.
  #
  # Returns nothing.
  def call
    return broadcast(:invalid, "The election form is invalid") if form.invalid?

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
      client: form.authority
    }
    LogEntry.create(log_entry_attributes)
  end
end
