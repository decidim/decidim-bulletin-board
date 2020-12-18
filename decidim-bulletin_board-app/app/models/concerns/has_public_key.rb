# frozen_string_literal: true

require "active_support/concern"

module HasPublicKey
  extend ActiveSupport::Concern

  included do
    try :before_create, lambda {
      self.public_key_thumbprint ||= calculate_thumbprint
    }
  end

  def public_key_rsa
    @public_key_rsa ||= JWT::JWK::RSA.import(public_key.symbolize_keys).public_key
  end

  def calculate_thumbprint
    Decidim::BulletinBoard::JwkUtils.thumbprint(public_key.symbolize_keys)
  end
end
