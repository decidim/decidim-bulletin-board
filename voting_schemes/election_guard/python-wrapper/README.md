# decidim-electionguard

Wrappers used to integrate ElectionGuard python code onto Decidim Elections module. It consists on three parts:

* Trustee wrapper: used to perform the trustees main tasks, the Key Ceremony and the Tally.
* Voter wrapper: used to encrypt a ballot.
* Bulletin Board wrapper: used to perform the ballot box tasks, during all the election lifecycle.

## Quick Start

Using [**make**](https://www.gnu.org/software/make/manual/make.html), the tests and package creation tasks can be run with one command:

```
make
```

The unit and integration tests can also be run with make:

```
make test
```
