# frozen_string_literal: true

class Election < ApplicationRecord
  belongs_to :authority
  has_many :election_trustees
  has_many :trustees, -> { order(id: :asc) }, through: :election_trustees
  has_many :log_entries, -> { order(id: :asc) }

  has_one_attached :verifiable_results

  enum status: { created: 0, key_ceremony: 1, key_ceremony_ended: 2, vote: 3, vote_ended: 4, tally_started: 5, tally_ended: 6, results_published: 7 }

  def manifest
    @manifest ||= log_entries.first.decoded_data
  end

  def voting_scheme_name
    @voting_scheme_name ||= manifest["scheme"]["name"]
  end

  def polling_stations
    @polling_stations ||= manifest["polling_stations"] || []
  end
end
