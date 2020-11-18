#!/bin/bash

# Install ElectionGuard dependencies
sudo apt-get install -y libgmp-dev libmpfr-dev libmpc-dev

# Install Decidim ElectionGuard wrappers (temporarily from the repository)
rm -rf ../../decidim-electionguard
git clone https://github.com/codegram/decidim-electionguard.git ../../decidim-electionguard
cd ../../decidim-electionguard && python3 setup.py install
