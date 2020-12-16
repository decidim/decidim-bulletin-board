# frozen_string_literal: true

require "active_support/concern"

module HasPublicKey
  extend ActiveSupport::Concern

  included do
    before_create :set_key_thumbprint
  end

  def set_key_thumbprint
    self.public_key_thumbprint ||= JwkUtils.thumbprint(public_key)
  end

  def public_key_rsa
    @public_key_rsa ||= JWT::JWK::RSA.import(public_key.symbolize_keys).public_key
  end
end
