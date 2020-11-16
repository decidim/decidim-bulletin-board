#!/bin/bash

# Install app dependencies
cd decidim-bulletin-board-app
MAKEFLAGS=-j4 gem install sassc # install sassc faster
bundle install --jobs 4
yarn install
bin/rails db:setup

# Install electionguard dependencies
rm -rf ~/.pyenv
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.bashrc

source ~/.bashrc
PYTHON_VERSION=3.8.2
env PYTHON_CONFIGURE_OPTS='--enable-shared' pyenv install $PYTHON_VERSION
pyenv global $PYTHON_VERSION

# Install Decidim ElectionGuard wrappers
cd /workspaces
git clone https://github.com/codegram/decidim-electionguard.git
cd decidim-electionguard
python setup.py install
