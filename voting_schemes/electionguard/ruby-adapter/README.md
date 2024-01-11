# VotingSchemes::Electionguard

The Bulletin Board is a generic API for storing and retrieving ballots and tallies for elections. The final implementation of the protocol used for creating an election may vary. This gem provides the [Microsoft's ElectionGuard](https://github.com/microsoft/electionguard-python) Javascript implementation for production use in Decidim.

Note that the ElectionGuard implementation works by using two different wrappers around Electionguard:

- A [Python Wrapper](../python-wrapper) for its use in the backend of the [GraphQL API server](../../../bulletin_board/server).
- A [Javascript Wrapper](../js-adapter) that compiles the whole Electionguard python app into web-assembly and allows to use it in the frontend (this ensure that the voting process is not tampered by sending any data to the backend).

This gem provides a very simple gem that wraps the Javascript implementation and allows to use it in the frontend of a Decidim application (Elections module).

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'voting_schemes-electionguard'
```

And then execute:

    $ bundle install

Or install it yourself as:

    $ gem install voting_schemes-electionguard

## Usage

You can see examples of usage by looking at the Decidim Elections module:

- https://github.com/decidim/decidim/blob/develop/decidim-elections/app/packs/src/decidim/elections/voter/casting-vote.js
- https://github.com/decidim/decidim/blob/develop/decidim-elections/app/packs/src/decidim/elections/election_log.js


## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/decidim/decidim-bulletin-board.
