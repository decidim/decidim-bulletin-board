# frozen_string_literal: true

class ElectionTrustee < ApplicationRecord
  has_many :elections
end
