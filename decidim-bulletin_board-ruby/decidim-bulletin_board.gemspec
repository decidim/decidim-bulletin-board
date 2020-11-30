# frozen_string_literal: true

require_relative "lib/decidim/bulletin_board/version"

Gem::Specification.new do |s|
  s.name = "decidim-bulletin_board"
  s.version = Decidim::BulletinBoard::VERSION
  s.authors = ["David Morcillo", "Svenja Schäfer"]
  s.email = ["david@codegram.com", "svenja@codegram.com"]

  s.summary = ""
  s.description = ""
  s.homepage = "https://github.com"
  s.license = "AGPL-3.0"
  s.required_ruby_version = Gem::Requirement.new(">= 2.6.6")

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  s.files = Dir.chdir(File.expand_path(__dir__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  end
  s.bindir = "exe"
  s.executables = s.files.grep(%r{^exe/}) { |f| File.basename(f) }
  s.require_paths = ["lib"]

  s.add_dependency "activesupport", "~> 5.0", ">= 5.0.0.1"
  s.add_dependency "byebug", "~> 11.0"
  s.add_dependency "graphlient", "~> 0.4.0"
  s.add_dependency "jwt"

  s.add_development_dependency "rake", "~> 13.0"
  s.add_development_dependency "rspec", "~> 3.7"
end
