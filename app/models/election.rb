# frozen_string_literal: true

class Election < ApplicationRecord
  belongs_to :client
  has_many :trustee
  has_many :log_entry
end
