#!/bin/bash

cd decidim-bulletin_board-app

# Install app dependencies
MAKEFLAGS=-j4 gem install sassc # install sassc faster
bundle install --jobs 4
npm install
bin/rails db:setup

# Install pyenv
rm -rf ~/.pyenv
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.bashrc

# Install python 3.8.2
source ~/.bashrc
PYTHON_VERSION=3.8.2
env PYTHON_CONFIGURE_OPTS='--enable-shared' pyenv install $PYTHON_VERSION
pyenv global $PYTHON_VERSION

# Install EG wrappers
./install_eg_wrappers.sh
