# frozen_string_literal: true

namespace :client do
  desc "Add a new client to the bulletin board"

  task :add_authority, [:name, :public_key] => :environment do |t, args|
    name = args[:name]
    public_key = args[:public_key]
    api_key = ""

    existent_auth = Authority.where("name = ? or public_key = ?", name, public_key).first

    if existent_auth
      puts "The authority already exists!"
      api_key = existent_auth.api_key
    else
      api_key = generate_api_key
      Authority.create!(name: name, public_key: public_key, api_key: api_key)
      puts "Authority '#{name}' successfuly added!"
    end
      puts "The API key for this authority is:"
      puts "#{api_key}"
  end

  def generate_api_key
    Digest::SHA2.new(512).hexdigest(SecureRandom.urlsafe_base64(96))
  end
end
