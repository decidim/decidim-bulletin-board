# frozen_string_literal: true

# A job to process tally messages
class ProcessTallyStepJob < ApplicationJob
  include ProcessEnqueuedMessage

  command_class ProcessTallyStep
  queue_as :tally
end
