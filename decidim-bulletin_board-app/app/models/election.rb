# frozen_string_literal: true

class Election < ApplicationRecord
  belongs_to :authority
  has_many :election_trustees
  has_many :trustees, through: :election_trustees
  has_many :log_entries, -> { order(id: :asc) }

  enum status: [:key_ceremony, :ready, :vote, :vote_ended, :tally, :tally_ended, :results_published]

  def manifest
    @manifest ||= log_entries.first.decoded_data
  end
end
