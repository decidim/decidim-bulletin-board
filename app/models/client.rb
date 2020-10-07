# frozen_string_literal: true

class Client < ApplicationRecord
  def rsa_public_key
    @rsa_public_key ||= OpenSSL::PKey::RSA.new(public_key)
  end
end
