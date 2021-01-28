# frozen_string_literal: true

# A job to process start tally messages
class StartTallyJob < ApplicationJob
  include ProcessEnqueuedMessage

  command_class StartTally
  queue_as :tally
end
