# frozen_string_literal: true

class Trustee < Client
  has_many :elections, through: :elections_trustees
end