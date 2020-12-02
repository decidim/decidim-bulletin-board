# frozen_string_literal: true

# A command with all the business logic to add a message to the pending messages list
class EnqueueMessage < Rectify::Command
  include HasMessageIdentifier

  # Public: Initializes the command.
  #
  # client - The client that sent the message
  # message_id - The message identifier
  # signed_data - The signed message received
  # job - The job that will process the message
  def initialize(client, message_id, signed_data, job)
    @client = client
    @message_id = message_id
    @signed_data = signed_data
    @job = job
  end

  # Executes the command. Broadcasts these events:
  #
  # - :ok when everything is valid.
  # - :invalid if the data wasn't valid and we couldn't proceed.
  #
  # Returns nothing.
  def call
    return broadcast(:invalid) unless valid?

    transaction do
      create_pending_message!
      job.perform_later(pending_message.id)
      broadcast(:ok, pending_message)
    end
  end

  private

  attr_reader :client, :signed_data, :job, :pending_message

  def valid?
    client && election && message_id && signed_data && job
  end

  def create_pending_message!
    @pending_message = PendingMessage.create!(
      client: client,
      election: election,
      message_id: message_id,
      signed_data: signed_data,
      status: :enqueued
    )
  end
end
