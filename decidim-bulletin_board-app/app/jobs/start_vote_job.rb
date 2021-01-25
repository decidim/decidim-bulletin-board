# frozen_string_literal: true

# A job to process start vote messages
class StartVoteJob < ApplicationJob
  include ProcessEnqueuedMessage

  command_class StartVote
  queue_as :vote
end
