# frozen_string_literal: true

class ElectionTrustee < ApplicationRecord
  belongs_to :election
  belongs_to :trustee
end
