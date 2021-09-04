# frozen_string_literal: true

# A job to process missing trustee reports
class ReportMissingTrusteeJob < ApplicationJob
  include ProcessEnqueuedMessage

  command_class ReportMissingTrustee
  queue_as :tally
end
