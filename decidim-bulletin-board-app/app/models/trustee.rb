# frozen_string_literal: true

class Trustee < Client
  has_many :election_trustees
  has_many :elections, through: :election_trustees

  def public_key_rsa
    @public_key_rsa ||= JWT::JWK::RSA.import(JSON.parse(public_key).symbolize_keys).public_key
  end
end
