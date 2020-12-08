# frozen_string_literal: true

class Client < ApplicationRecord
  after_initialize :set_unique_id
  before_create :set_unique_id

  def set_unique_id
    self.unique_id ||= name&.parameterize
  end

  def public_key_rsa
    @public_key_rsa ||= JWT::JWK::RSA.import(public_key.symbolize_keys).public_key
  end

  def authority?
    false
  end

  def bulletin_board?
    false
  end

  def trustee?
    false
  end
end
