# frozen_string_literal: true

class PendingMessage < ApplicationRecord
  belongs_to :client
  belongs_to :election, optional: true

  enum status: [:enqueued, :accepted, :rejected, :processed].map { |status| [status, status.to_s] }.to_h
end
