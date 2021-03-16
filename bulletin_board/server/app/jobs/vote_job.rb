# frozen_string_literal: true

# A job to process vote messages
class VoteJob < ApplicationJob
  include ProcessEnqueuedMessage

  command_class Vote
  queue_as :vote
end
