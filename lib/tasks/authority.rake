# frozen_string_literal: true

namespace :authority do
  desc 'Add a new authority to the bulletin board'

  task :add, [:name, :public_key] do |t, args|
    puts "Args were: #{args}"
    puts "Task was: #{t}"
  end
end
