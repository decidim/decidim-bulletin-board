# frozen_string_literal: true

class PendingMessage < ApplicationRecord
  include Message

  belongs_to :client
  belongs_to :election

  enum status: { enqueued: 0, rejected: 1, accepted: 2 }

  def processed?
    accepted? || rejected?
  end
end
