# frozen_string_literal: true

class Election < ApplicationRecord
  belongs_to :authority
  has_many :election_trustees
  has_many :trustees, through: :election_trustees
  has_many :log_entries

  def voting_scheme
    @voting_scheme ||= voting_scheme_class.new(self)
  end

  def voting_scheme_class
    VotingSchemes.from_name(manifest["scheme"]["name"])
  end

  def manifest
    @manifest ||= log_entries.first.decoded_data
  end
end
