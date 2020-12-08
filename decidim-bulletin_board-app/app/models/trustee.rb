# frozen_string_literal: true

class Trustee < Client
  has_many :election_trustees
  has_many :elections, through: :election_trustees

  def trustee?
    true
  end
end
