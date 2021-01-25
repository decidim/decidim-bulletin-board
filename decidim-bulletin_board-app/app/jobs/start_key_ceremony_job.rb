# frozen_string_literal: true

# A job to process start key ceremony messages
class StartKeyCeremonyJob < ApplicationJob
  include ProcessEnqueuedMessage

  command_class StartKeyCeremony
  queue_as :key_ceremony
end
