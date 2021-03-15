#!/usr/bin/env bash

set -e

echo "Installing ElectionGuard dependencies"
apt-get install -y libgmp-dev libmpfr-dev libmpc-dev libffi-dev

echo "Update Pip"
python3 -m pip install cryptography==3.2.1

echo "Install Decidim ElectionGuard wrappers from the same repository"
cd ../voting_schemes/electionguard/python-wrapper
python3 setup.py install
