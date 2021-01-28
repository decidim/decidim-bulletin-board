# frozen_string_literal: true

# A job to process end vote messages
class EndVoteJob < ApplicationJob
  include ProcessEnqueuedMessage

  command_class EndVote
  queue_as :vote
end
