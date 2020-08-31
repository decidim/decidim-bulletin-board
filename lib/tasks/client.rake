# frozen_string_literal: true

namespace :client do
  desc "Add a new client to the bulletin board"

  task :add_authority, [:name, :public_key] => :environment do |_t, args|
    name = args[:name]
    public_key = args[:public_key]

    auth = Authority.find_by("name = ? or public_key = ?", name, public_key)

    if !auth
      auth = Authority.create!(name: name, public_key: public_key, api_key: generate_api_key)
      puts "Authority '#{auth.name}' successfuly added!"
    else
      puts "The authority already exists!"
    end

    puts "The API key for this authority is: #{auth.api_key}"
  end

  def generate_api_key
    SecureRandom.urlsafe_base64(96)
  end
end
