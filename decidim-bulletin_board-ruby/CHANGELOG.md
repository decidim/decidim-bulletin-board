# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## Changed

- `getPendingMessage` can get queried by `messageId` and by `id`.

## Added

- `getPendingMessageStatus` method to the `Decidim::BulletinBoard::Client`.
- `waitForPendingMessageToBeProcessed` method to the Voter class.

## [0.7.0] - 2021-01-26

## Changed

- The `Trustee` class now uses the `Election` class to interact with the log entries.
- The `Trustee` class handles everything now when performing both the key ceremony and the tally process.
- The `Trustee` class now includes a `setupKeyCeremony` generator function that must be called before starting the key ceremony process.
- `checkRestoreNeeded` method has been renamed to `needsToBeRestored` for both the `Trustee` and the `TrusteeWrapper`.

## Added

- `start_tally` method to the `Decidim::BulletinBoard::Client`.
- `publish_results` method to the `Decidim::BulletinBoard::Client`.
- `Election` class in the JS package to handle the election state. An instance of this class will be used by the key ceremony and the trustee to check anything related to log entries.
- The `Trustee` class now has a `teardown` method that is called automatically to clean a few things. It can be called early to avoid memory leaks if needed.
- The `EventManager` class now handles the `events` stream and exports some useful constants.

## Removed

- The `KeyCeremony` class has been removed.
- The `Trustee` backup method has been removed because it doesn't belong to the public API anymore.

## [0.6.1] - 2021-01-12

### Changed

- Production file now is called `decidim-bulletin_board.js` and development file is called `decidim-bulletin_board.dev.js`.

### Removed

- The GraphQL client doesn't use subscriptions anymore.

## [0.6.0] - 2021-01-12

### Changed

- Updated the app schema definition with the partial log entries list retrieval
- Gem is an engine, the js assets can be imported in Decidim.

## [0.5.3] - 2020-12-20

### Fixed

- Fix the schema definition folder when used inside an app

## [0.5.2] - 2020-12-20

### Fixed

- Include the schema definition within the gem to avoid extra trips to the server

## [0.5.1] - 2020-12-19

### Fixed

- Include the missing `close_ballot_box` method from the 0.4.0 release.
- Fixes for the client methods

## [0.5.0] - 2020-12-19

### Changed

- Renamed `setup_election` to `create_election` and moved `election_id` from the `election_data` to a separate argument.

### Fixed

- Include the missing `open_ballot_box` methods from the 0.4.0 release.
- Added missing namespace on the seed task

## [0.4.0] - 2020-12-18

### Added

- `content_hash` field for the `LogEntry` records with the hash of the `content` field, if included in the message.
- `Command` base class for all the classes representing GraphQL queries or mutations sent to the Bulletin Board.
- `open_ballot_box` and `close_ballot_box` methods to the `Decidim::BulletinBoard::Client`.

### Changed

- New format for the messages: `iat`, `message_id` and Bulletin Board fields in the root message, and `content` for the Voting Scheme messages.
- Improved consistency between methods included by `Decidim::BulletinBoard::Client`.

## [0.3.1] - 2020-12-10

### Fixed

- Uses the correct private key in the `sign_data` method.

## [0.3.0] - 2020-12-10

### Added

- `Decidim::BulletinBoard::Authority` namespace that includes commands and forms to get the status of an election.

### Changed

- `Decidim::BulletinBoard::Client` now includes a `get_status` method to get the election status using the `Authority` namespace.

### Fixed

- `Decidim::BulletinBoard::Voter::CastVote` command uses the `encrypted_vote` as a `String` and not as a `Hash`.

## [0.2.0] - 2020-12-08

### Added

- `Decidim::BulletinBoard::Voter` namespace that includes commands and forms to perform the cast vote action.

### Changed

- `Decidim::BulletinBoard::Client` now includes a `cast_vote` method to cast a vote using the `Voter` namespace.

## [0.1.0] - 2020-12-07

### Added

- `Decidim::BulletinBoard::Client` class totally configurable using `ActiveSupport::Configurable`
- The client now includes a `setup_election` method that creates the election in the bulletin board.

[unreleased]: https://github.com/decidim/decidim-bulletin-board/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/decidim/decidim-bulletin-board/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/decidim/decidim-bulletin-board/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/decidim/decidim-bulletin-board/releases/tag/v0.1.0
