Verifying the election
======================

This directory contains code for verifying the election. It requires at least Java v8 (v11 recommended) and NodeJS v16 to be installed.

In order to run the verifier, you need to build the verifier jar, and then run it:

**First, be sure to install the electionguard-java submodule:**

```bash
git submodule update --init --recursive
```

This step is only required once, or when the submodule is updated. Be sure that the folder `voting_schemes/electionguard/verifier/electionguard-java ` is empty. This step installs a [Gradle]https://gradle.org/() script to build the JAR, however it shouldn't be necessary to have "gradle" installed. If interested, just install it with `apt install gradle` or similar.

**Second, install all the dependencies by running:**

```bash
make install_verifier
```

If you see a **BUILD SUCCESSFUL** message, you are ready to run the verifier.

Running the verifier
--------------------

The verification process involves two things:

- checking a file, which may contain a ballot or the whole encrypted election (depending on what you want to verify). The process of verifying a ballot spoils the ballot itself, so it can't be send to the real election afterwards (the user will need to vote again and generate a new ballot).
- Connection to the Bulletin Board API, which contains all the signed transactions for the election. This is done by providing a URL to the API, no extra requirements are necessary.

The verifier can be run with the following command:

```bash
node src/index.js FILE_TO_VERIFY BULLETIN_BOARD_URL
```

For help and examples run the script with the `--help` modifier:

```bash
node src/index.js --help
```

### Verifying a ballot


First, change to the `verifier` directory:

```bash

- Common Verifiers
  - Chained hashes
  - Content hashes
  - Signed data is properly signed
  - IATs (???)
  - Election checks
    - number of trustees >= quorum > 1
    - start date < end_date
    - client name and pretty name (???)
    - at least 1 contest
    - each contest has at least 2 candidates
    - vote_variation, number_elected and votes_allowed (???)
  - Print pretty results
