# frozen_string_literal: true

require_relative 'lib/decidim/bulletin_board/version'

Gem::Specification.new do |s|
  s.name          = 'decidim-bulletin_board'
  s.version       = Decidim::BulletinBoard::VERSION
  s.authors       = ['David Morcillo']
  s.email         = ['david@codegram.com']

  s.summary       = ''
  s.description   = ''
  s.homepage      = 'https://github.com'
  s.license       = 'MIT'
  s.required_ruby_version = Gem::Requirement.new('>= 2.3.0')

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  s.files = Dir.chdir(File.expand_path(__dir__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  end
  s.bindir        = 'exe'
  s.executables   = s.files.grep(%r{^exe/}) { |f| File.basename(f) }
  s.require_paths = ['lib']

  s.add_dependency 'rubocop', '~> 0.92.0'
end