# frozen_string_literal: true

# A job to process publish results messages
class PublishResultsJob < ApplicationJob
  include ProcessEnqueuedMessage

  command_class PublishResults
  queue_as :publish_results
end
