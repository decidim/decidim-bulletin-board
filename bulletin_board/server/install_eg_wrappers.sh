#!/usr/bin/env bash

set -e

echo "Update Pip"
python3 -m pip install cryptography==3.2.1

echo "Install the last ElectionGuard version"
cd ../../voting_schemes/electionguard/electionguard-python
make environment build

echo "Install Decidim ElectionGuard wrappers from the same repository"
cd ../python-wrapper
python3 setup.py install
