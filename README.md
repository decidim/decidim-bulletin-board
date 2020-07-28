# README

The Bulletin Board is a service composed by an Encryption Engine and an Append-Only Log. External queries to the Encryption Engine are allowed through an API.


Things you may want to cover:

* Ruby version: 2.6
* Rails version: 6

* System dependencies:

The Bulletin Board depends on the existence of a Decidim installation.


* Installation. Execute these commands:
```
bundle install
yarn install
rails db:create
rails db:migrate
```


* How to run the test suite
```
bundle exec rspec
```