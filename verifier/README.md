Verifying the election
======================

This directory contains code for verifying the election. 

Running the verifier requires (at the moment) several dependencies:

- Java v8 or higher
- Node.JS v12 or higher
- Python 3.8.11 (higher might work, no promises here)

To start, please clone this repository:

```bash
git clone https://github.com/decidim/decidim-bulletin-board.git
cd decidim-bulletin-board
```

In order to run the verifier, you need to build the verifier jar, and then run it:

**First, be sure to install the electionguard-java submodule:**

```bash
git submodule update --init --recursive
```

This step is only required once, or when the submodule is updated. Be sure that the folder `voting_schemes/electionguard/verifier/electionguard-java ` is empty. This step installs a [Gradle](https://gradle.org/) script to build the JAR, however it shouldn't be necessary to have "gradle" installed. If interested, just install it with `apt install gradle` or similar.

**Second, install all the dependencies by running:**

```bash
make install_verifier
```

**Finally, install the electionguard python package**

```bash
make install_electionguard_python_wrapper
```

If you see a **BUILD SUCCESSFUL** message and no errors, you are ready to run the verifier.

Running the verifier
--------------------

The verification process involves two things:

- checking a file, which may contain a ballot or the whole encrypted election (depending on what you want to verify). The process of verifying a ballot spoils the ballot itself, so it can't be send to the real election afterwards (the user will need to vote again and generate a new ballot).
- Connection to the Bulletin Board API, which contains all the signed transactions for the election. This is done by providing a URL to the API, no extra requirements are necessary. This step is only needed when verifying the a single ballot, when verifying the whole election, the bulletin board URL is not needed as all the necessary information is contained in the TAR file.

### Verifying a single ballot

The verifier can be run with the following command:

```bash
bin/verify FILE_TO_VERIFY BULLETIN_BOARD_URL
```

- The `FILE_TO_VERIFY` can be downloaded from the Decidim application, just before casting a vote (a file ending in `.txt`).
- The `BULLETIN_BOARD_URL` is the URL of the Bulletin Board API, for example `https://bulletinboard.example.com/api/`

### Verifying the whole election

The verifier can be run with the following command:

```bash
bin/verify_election ELECTION_TAR_FILE
```
- The `ELECTION_TAR_FILE` is the TAR file downloaded from the Decidim application, just after the election is finished and the results published (a file ending in `.tar`). Look for the "Election log" link to find it.

For help and examples, run the script with the `--help` modifier:

```bash
bin/verify --help
```

