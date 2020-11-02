# frozen_string_literal: true

class Client < ApplicationRecord
  after_initialize :set_unique_id
  before_create :set_unique_id

  def set_unique_id
    self.unique_id ||= name&.parameterize
  end

  def rsa_public_key
    @rsa_public_key ||= OpenSSL::PKey::RSA.new(public_key)
  end
end
