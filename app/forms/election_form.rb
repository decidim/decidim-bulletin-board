# frozen_string_literal: true

class ElectionForm < Form
  validates :title, presence: true
  validates :status, presence: true
  attribute :client, Client
end
