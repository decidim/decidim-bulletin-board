# frozen_string_literal: true

# A command with all the business logic to create a new election
class CreateElection < Rectify::Command
  # Public: Initializes the command.
  #
  # form - A form object with the params.
  def initialize(form)
    # TODO: This logic needs to be migrated to a GraphQL class
    # which will invoke the call method
    # and the initialize method will receive the form through parameters
    @form = form
  end

  # Executes the command. Broadcasts these events:
  #
  # - :ok when everything is valid.
  # - :invalid if the form wasn't valid and we couldn't proceed.
  #
  # Returns nothing.
  def call
    return broadcast(:invalid) if form.invalid?

    transaction do
      create_election
    end
    broadcast(:ok, election)
  end

  private

  attr_reader :form, :election

  def create_election
    election_attributes = {
      title: form.title,
      status: form.status,
      client: form.client
    }
    @election = Election.create(election_attributes)

    log_entry_attributes = {
      data: form.data,
      data_hash: form.data_hash,
      log_type: form.log_type,
      election: @election
    }
    LogEntry.create(log_entry_attributes)
  end
end
