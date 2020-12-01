# frozen_string_literal: true

class PendingMessage < ApplicationRecord
  belongs_to :client
  belongs_to :election

  enum status: [:enqueued, :rejected, :accepted].map { |status| [status, status.to_s] }.to_h

  def processed?
    accepted? || rejected?
  end
end
