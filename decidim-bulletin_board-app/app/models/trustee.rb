# frozen_string_literal: true

class Trustee < Client
  has_many :election_trustees
  has_many :elections, through: :election_trustees

  def slug
    unique_id.split(".").last
  end

  def author?(message_identifier)
    message_identifier.author_id == slug
  end

  def trustee?
    true
  end
end
