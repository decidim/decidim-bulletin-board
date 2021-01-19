# frozen_string_literal: true

class Election < ApplicationRecord
  belongs_to :authority
  has_many :election_trustees
  has_many :trustees, through: :election_trustees
  has_many :log_entries

  enum status: [:key_ceremony, :ready, :vote, :tally, :results, :results_published].map { |status| [status, status.to_s] }.to_h

  def manifest
    @manifest ||= log_entries.first.decoded_data
  end
end
