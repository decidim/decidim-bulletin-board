# frozen_string_literal: true

require_relative "lib/voting_schemes/electionguard/version"

Gem::Specification.new do |s|
  s.name = "voting_schemes-electionguard"
  s.version = VotingSchemes::Electionguard::VERSION
  s.authors = ["David Morcillo", "Svenja Schäfer", "Leonardo Diez", "Agustí B.R."]
  s.email = ["david@codegram.com", "svenja@codegram.com", "leo@codegram.com", "agusti@codegram.com"]

  s.summary = ""
  s.description = ""
  s.homepage = "https://github.com/decidim/decidim-bulletin-board"
  s.license = "AGPL-3.0"
  s.required_ruby_version = Gem::Requirement.new(">= 3.1.1")

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  s.files = Dir.chdir(File.expand_path(__dir__)) do
    `git ls-files -z`
      .split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
      .concat(["app/assets/javascripts/voting_schemes/electionguard/electionguard.js"])
      .concat(Dir.glob("public/assets/electionguard/*"))
  end
  s.bindir = "exe"
  s.executables = s.files.grep(%r{^exe/}) { |f| File.basename(f) }
  s.require_paths = ["lib"]

  s.add_dependency "rails", ">= 5.0.0"

  s.add_development_dependency "rake", "~> 13.0"
  s.add_development_dependency "rspec", "~> 3.7"
end
