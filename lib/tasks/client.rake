# frozen_string_literal: true

namespace :client do
  desc "Add a new client to the bulletin board"

  task :add_authority, [:name, :public_key] => :environment do |t, args|
    puts "Args were: #{args}"
    puts "Task was: #{t}"
    ::Client.create!(client_type: "authority", name: args[:name], key: args[:public_key])
  end
end
