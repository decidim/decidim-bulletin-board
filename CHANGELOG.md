# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.24.1] - 2022-11-11

## Fixed

- Fixed issue with bulletin board Ruby client OpenSSL 3.0 compatibility

## [0.24.0] - 2022-08-26

## Changed

- The minimum required Ruby version is now 3.1.1
- The bulletin board client now supports OpenSSL 3.0 through update of the `jwt` dependency to 2.5.0

## [0.23.0] - 2022-04-05

## Changed

- The minimum required Ruby version is now 3.0.2

## [0.22.3] - 2021-09-08

## [0.22.2] - 2021-09-07

## [0.22.1] - 2021-09-06

## [0.22.0] - 2021-09-06

## Added

- The bulletin board client now includes a `report_missing_trustee` method to report the absence of a trustee during the Tally phase.

## [0.21.2] - 2021-05-28

## [0.21.1] - 2021-04-23

## Added

- `GetElectionLogEntries` now returns `chainedHash`
- The `MessageParser` gets exported individually

## [0.21.0] - 2021-04-22

## Changed

- The bulletin board client also gets the election's verifiable data along with its results

## [0.20.0] - 2021-04-22

## Changed

- Tally and Key Ceremony components API have been changed a bit. The `setupElection` method should be called before binding the UI elements to the component.

## [0.19.0] - 2021-04-16

## Added

- The voter `encrypt` method now returns the `plainVote` and the `electionUniqueId` so it will be included when the user audits the ballot.

## [0.18.0] - 2021-04-16

## Added

- The bulletin board client now accepts the `polling_stations` param with a list of valid polling stations identifiers for running hybrid elections.
- The bulletin board client now includes a `in_person_vote` to inform the server about physical votes.

## [0.17.1] - 2021-04-14

## Fixed

- Use the correct main file in the bulletin board javascript client.

## [0.17.0] - 2021-04-12

## Added

- The bulletin board client now accepts the `ballot_styles` param when creating an election.

## [0.16.1] - 2021-04-12

## [0.16.0] - 2021-04-06

## Added

- The bulletin board client now includes a `reset_test_database` method that can be called in the test environment to clear the bulletin board database.

## [0.15.2] - 2021-03-19

## [0.15.1] - 2021-03-19

## [0.15.0] - 2021-03-19

### Changed

- The `publish_results` method now returns a pending message.

## [0.14.0] - 2021-02-25

### Changed

- The `onSetup` event is no longer supported when adding the key ceremony, tally and voter components.

## [0.13.1] - 2021-02-25

### Changed

- The `create_election` method doesn't need the `weight` field for questions and answers anymore. It will use the given order to create the `sequence_order` value.

## [0.13.0] - 2021-02-23

## [0.12.1] - 2021-02-22

### Changed

- The `VoteComponent` event names have been changed to more suitable ones.

## [0.12.0] - 2021-02-19

### Added

- The `Voter` returns the ballot hash after encrpyting the plain vote and before auditing or casting it

### Changed

- The `create_election` command now expects objects representing the parts public keys.

## [0.11.0] - 2021-02-18

### Changed

- Changed the name of some settings\* to improve the readability of the code:
  - BB settings: `bulletin_board_server`\* and `bulletin_board_public_key`\*.
  - Authority settings: `authority_api_key`\*, `authority_name` and `authority_private_key`\*.
  - Elections settings: `scheme_name`, `number_of_trustees` and `quorum`.
- `KeyCeremonyComponent` and `TallyComponent` now accepts a `trusteeWrapperAdapter` object.
- The `processMessage` method from the `TrusteeWrapperAdapter` now accepts a `messageType` instead of a `messageIdentifier`.

### Removed

- The `TrusteeWrapper` for the "dummy" voting scheme has been removed from the project.

### Added

- The `TrusteeWrapperAdapter` abstract class can be used to implement any voting scheme wrapper adapter.

## [0.10.1] - 2021-02-15

### Fixed

- The `TallyComponent` now uses the `key_ceremony` messages as well.

## [0.10.0] - 2021-02-12

## Added

- A command to get decoded election results.
- The (Bulletin Board) server public key is now included in the gem configuration.
- The option to `audit` a vote.

## Changed

- The `get_election_log_entries_by_type` command got renamed to `get_election_results`.
- The `create_election` command now receives all the information needed in a simple hash and builds the message to add to the election log. It only needs seven main keys: `trustees`, `default_locale`, `title`, `start_date`, `end_date`, `questions` and `answers`.
- The `scheme` setting was replaced by the `scheme_name` and `quorum` settings.

## [0.9.2] - 2021-02-02

## [0.9.1] - 2021-02-02

## Added

- The `VoteComponent` has been added. It will be used as a glue code between the vote and the UI.
- The ruby client now includes the `get_election_log_entries_by_types` method to get the election log entries filtered by type.

## [0.9.0] - 2021-02-01

## Changed

- The `open_ballot_box` and `close_ballot_box` are now called `start_vote` and `end_vote` and return a pending message.
- All the client operations yield the `message_id` before sending the request to the Bulletin Board.

## Added

- `start_key_ceremony` method to the `Decidim::BulletinBoard::Client`.
- The `IdentificationKeys` class has been added to the JS library.
- The `TallyComponent` has been added. It will be used as a glue code between the tally and the UI.

## [0.8.2] - 2021-01-28

## Changed

- `encrypt` in `VoterWrapperDummy` has a TimeOut of 500ms.

## [0.8.0] - 2021-01-27

## Changed

- `getPendingMessage` can get queried by `messageId` and by `id`.
- `get_status` renamed to `get_election_status` in the `Decidim::BulletinBoard::Client`.

## Added

- `getPendingMessageStatus` method to the `Decidim::BulletinBoard::Client`.
- `waitForPendingMessageToBeProcessed` method to the Voter class.
- The `KeyCeremonyComponent` has been added. It will be used as a glue code between the key ceremony process and the UI.

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
