# frozen_string_literal: true

require "rack/utils"

namespace :client do
  desc "Add a new authority to the bulletin board"
  task :add_authority, [:name, :public_key] => :environment do |_t, args|
    name = args[:name]
    public_key = Rack::Utils.parse_nested_query(args[:public_key])

    begin
      public_key, public_key_thumbprint = parse_public_key(public_key)
    rescue StandardError
      puts "The authority might have sent you their private key!"
      puts "The authority needs to generate another pair of keys and then send only the public key."
      next
    end

    authority = Authority.new(name:, public_key:, public_key_thumbprint:, api_key: generate_api_key)
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
    jwk = public_key.symbolize_keys

    jwk = JWT::JWK.import(jwk)

    jwk.export.then do |hash|
      [hash, Decidim::BulletinBoard::JwkUtils.thumbprint(hash)]
    end
  end
end
