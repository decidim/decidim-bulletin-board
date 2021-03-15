# frozen_string_literal: true

# A job to process key ceremony messages
class ProcessKeyCeremonyStepJob < ApplicationJob
  include ProcessEnqueuedMessage

  command_class ProcessKeyCeremonyStep
  queue_as :key_ceremony
end
