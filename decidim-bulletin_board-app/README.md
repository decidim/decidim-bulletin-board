# README

The Bulletin Board is a service composed by an Encryption Engine and an Append-Only Log. External queries to the Encryption Engine are allowed through an API.

* Ruby version: 2.6
* Rails version: 6

* System dependencies:

The Bulletin Board depends on the existence of a Decidim installation.


* Installation:

First, clone the repository and enter in the new folder:
```
git clone git@github.com:decidim/decidim-bulletin-board.git
cd decidim-bulletin-board
```

Now, execute these commands:
```
bundle install
yarn install
rails db:create
rails db:migrate
```


* How to run the rubocop linter
```
bundle exec rubocop
```


* How to run the test suite
```
bundle exec rspec
```

## License

See [Decidim](https://github.com/decidim/decidim).
