# README

The Bulletin Board is a service composed by an Encryption Engine and an Append-Only Log. External queries to the Encryption Engine are allowed through an API.

- Ruby version: 3.1
- Rails version: 6
- Python version: 3.8.2

- System dependencies:
- Python gmpy2 package dependencies: libgmp, libmpfr and libmpc

The Bulletin Board is intended to use alongside a Decidim installation. It's main purpose is to provide a GraphQL interface to a secure, auditable and verifiable voting system. This is currently achieved by using the [ElectionGuard python implementation](https://github.com/microsoft/electionguard-python), developed by Microsoft. So this server acts as a wrapper to the ElectionGuard python code.

Please check the [main documentation](../../README.adoc) for this repository for more convenient ways to run the Bulletin Board.

## Installation:

First, clone the repository and enter in the new folder:

```bash
git clone git@github.com:decidim/decidim-bulletin-board.git
cd decidim-bulletin-board/server
```

Now, execute these commands:

```bash
bundle install
npm install
rails db:create
rails db:migrate
```

## Run the server

```bash
bin/rails server
```

Conect to the GraphQL interface in http://localhost:3000/api (documentation is embedded)

## other commands

- How to run the rubocop linter

```bash
bundle exec rubocop
```

- How to run the test suite

```bash
bundle exec rspec
```

- How to update the GraphQL schema definition run:

```bash
bundle exec rake schema:generate
npm run schema:generate
```

## License

See [Decidim](https://github.com/decidim/decidim).
