# frozen_string_literal: true

class PendingMessage < ApplicationRecord
  include Message

  belongs_to :client
  belongs_to :election

  enum status: [:enqueued, :rejected, :accepted]

  def processed?
    accepted? || rejected?
  end
end
