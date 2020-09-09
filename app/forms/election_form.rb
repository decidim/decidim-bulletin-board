# frozen_string_literal: true

class ElectionForm < Form
  attribute :title, String
  attribute :status, String
  attribute :client, Client

  validates :title, presence: true
  validates :status, presence: true
  validates :client, presence: true
end
