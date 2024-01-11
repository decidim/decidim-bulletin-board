# Decidim::BulletinBoard

The Bulletin Board is a service composed by an Encryption Engine and an Append-Only Log. External queries to the Encryption Engine are allowed through a GraphQL API (see https://github.com/decidim/decidim-bulletin-board).

This gem provides a collection of commands to interact with such API using Ruby. Mainly for it's use in a backend service.

## Installation

Run this command to add the gem to your Gemfile:

```console
bundle add decidim-bulletin_board
```

```console
bundle install
```

Or install it yourself as:

```console
gem install decidim-bulletin_board
```

## Usage

Basic usage involves creating a client and using it to perform the desired operations:

```ruby
# Instantiate a client
bulletin_board = Decidim::BulletinBoard::Client.new

# Perform operations
bulletin_board.cast_vote(election_id, voter_id, encrypted_data) do |message_id|
  # Do something else with the message_id
end
```

See a list of available operations here: https://github.com/decidim/decidim-bulletin-board/blob/develop/bulletin_board/ruby-client/lib/decidim/bulletin_board/client.rb

This module is used by the module Decidim Elections, check it out here: 

- https://github.com/decidim/decidim/tree/develop/decidim-elections

Usage examples:

- https://github.com/decidim/decidim/blob/develop/decidim-elections/lib/decidim/elections.rb
- https://github.com/decidim/decidim/blob/develop/decidim-elections/app/commands/decidim/elections/voter/cast_vote.rb
- https://github.com/decidim/decidim/blob/develop/decidim-elections/app/commands/decidim/elections/voter/update_vote_status.rb
- https://github.com/decidim/decidim/blob/develop/decidim-elections/app/commands/decidim/elections/admin/setup_election.rb


## Contributing

See [Decidim](https://github.com/decidim/decidim).

## License

See [Decidim](https://github.com/decidim/decidim).

## Code of Conduct

See [Decidim](https://github.com/decidim/decidim).
