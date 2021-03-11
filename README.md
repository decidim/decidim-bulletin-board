# Decidim Bulletin Board

This repository follows the monorepo pattern and includes the following projects:

- **decidim-bulletin_board-app**: A Ruby on Rails application that contains the Bulletin Board service. You can check the project details [here](https://github.com/decidim/decidim-bulletin-board/blob/develop/decidim-bulletin_board-app/README.md).
- **decidim-bulletin_board-ruby**: A Ruby gem that can be included in other applications to interact with the Bulletin Board application. You can check the project details [here](https://github.com/decidim/decidim-bulletin-board/blob/develop/decidim-bulletin_board-ruby/README.md).
- **verifier**: A command line application to audit ballots and verify the election results.
- **voting_schemes**: Implementation of different cryptographic voting schemes to be used to celebrate the elections. Currently it includes the Dummy scheme, used only for testing purposes, and the ElectionGuard scheme, based on the Python implementation of the protocol.

## License

See [Decidim](https://github.com/decidim/decidim).
