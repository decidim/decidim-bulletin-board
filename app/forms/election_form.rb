# frozen_string_literal: true

class ElectionForm < Form
  attribute :title, String
  attribute :status, String
  attribute :client, Client
  attribute :data, String
  attribute :data_hash, String
  attribute :log_type, String

  validates :title, presence: true
  validates :status, presence: true
  validates :client, presence: true
  validates :data, presence: true
  validates :data_hash, presence: true
  validates :log_type, presence: true
end
