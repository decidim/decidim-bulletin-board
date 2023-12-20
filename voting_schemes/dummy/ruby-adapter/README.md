# VotingSchemes::Dummy

The Bulletin Board is a generic API for storing and retrieving ballots and tallies for elections. The final implementation of the protocol used for creating an election may vary. This gem provides a dummy implementation for testing purposes.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'voting_schemes-dummy'
```

And then execute:

    $ bundle install

Or install it yourself as:

    $ gem install voting_schemes-dummy

## Usage

This implementation is intended for testing purposes only. It allows to test the Bulletin Board without the need to use a fully configured Decidim installation.
It also skips the encryption and decryption steps, so it is not suitable for production use.

You can [start the server](../../bulletin_board/server) in development mode and connect to the built-in testing admin sandbox at:

http://localhost:3000/sandbox


## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/decidim/decidim-bulletin-board/issues.
