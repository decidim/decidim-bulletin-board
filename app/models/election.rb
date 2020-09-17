# frozen_string_literal: true

class Election < ApplicationRecord
  belongs_to :authority, class_name: "Client"
  has_many :trustees, through: :elections_trustees
  has_many :log_entries
end
