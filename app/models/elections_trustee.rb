# frozen_string_literal: true

class ElectionsTrustee < ApplicationRecord
  belongs_to :election
  belongs_to :trustee
end
