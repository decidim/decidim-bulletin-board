# frozen_string_literal: true

# A command with all the business logic to create a new election
class CreateElection < Rectify::Command
  # Public: Initializes the command.
  #
  # form - A form object with the params.
  def initialize(form, author)
    @form = form
    @author = author
  end

  # Executes the command. Broadcasts these events:
  #
  # - :ok when everything is valid.
  # - :invalid if the form wasn't valid and we couldn't proceed.
  #
  # Returns nothing.
  def call
    # return broadcast(:invalid) if form.invalid?

    create_election

    broadcast(:ok, election)
  end

  private

  attr_reader :form, :election

  def create_election
    # TODO
  end
end
