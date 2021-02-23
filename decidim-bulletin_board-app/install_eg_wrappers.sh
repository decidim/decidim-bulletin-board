#!/usr/bin/env bash

set -e

echo "Installing ElectionGuard dependencies"
sudo apt-get install -y libgmp-dev libmpfr-dev libmpc-dev libffi-dev

echo "Update Pip"
python3 -m pip install cryptography==3.2.1

echo "Install Decidim ElectionGuard wrappers (temporarily from the repository)"
if [ -d /tmp/decidim-electionguard ] ; then
  rm -rf /tmp/decidim-electionguard
fi

git clone https://github.com/decidim/decidim-electionguard.git /tmp/decidim-electionguard
cd /tmp/decidim-electionguard
python3 setup.py install
