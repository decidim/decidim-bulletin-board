# frozen_string_literal: true

require "jwk_utils"

namespace :client do
  desc "Add a new client to the bulletin board"

  class PrivateKeyError < StandardError; end

  task :add_authority, [:name, :public_key] => :environment do |_t, args|
    name = args[:name]

    begin
      public_key, public_key_thumbprint = parse_public_key(args[:public_key])
    rescue PrivateKeyError
      puts "WARNING! The authority sent you their private key!"
      puts "The authority needs to generate another pair of keys and then send only the public key."
      next
    end

    authority = Authority.new(name: name, public_key: public_key, public_key_thumbprint: public_key_thumbprint, api_key: generate_api_key)
    begin
      authority.save!
      puts "Authority '#{authority.name}' successfuly added!"
    rescue ActiveRecord::RecordNotUnique
      authority = Authority.find_by("unique_id = ? or public_key_thumbprint = ?", authority.unique_id, authority.public_key_thumbprint)
      puts "The authority already exists!"
    end

    puts "The API key for this authority is: #{authority.api_key}"
  end

  def generate_api_key
    SecureRandom.urlsafe_base64(96)
  end

  def parse_public_key(public_key)
    public_key.strip!

    jwk = if public_key.starts_with?("-----BEGIN ")
            public_key.gsub!(".", "\n")

            raise PrivateKeyError if public_key.include?("PRIVATE KEY")

            JWT::JWK.new(OpenSSL::PKey::RSA.new(public_key))
          else
            json = JSON.parse(public_key).symbolize_keys

            raise PrivateKeyError if JwkUtils.private_key?(json)

            JWT::JWK.import(json)
          end

    jwk.export.yield_self do |hash|
      [hash, JwkUtils.thumbprint(hash)]
    end
  end
end
