# frozen_string_literal: true

class LogEntry < ApplicationRecord
  belongs_to :election
  belongs_to :client
end
