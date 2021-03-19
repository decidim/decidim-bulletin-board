FROM ruby:2.6.6
LABEL author="david@codegram.com"

ARG DEBIAN_FRONTEND=noninteractive

# Environment variables
ENV SECRET_KEY_BASE 1234
ENV RAILS_ENV production
ENV PYENV_ROOT /root/.pyenv
ENV PATH $PYENV_ROOT/shims:$PYENV_ROOT/bin:$PATH
ENV PYTHON_VERSION=3.8.2
ENV PYTHON_CONFIGURE_OPTS='--enable-shared'
ENV HOME /root
ENV PATH="$HOME/.poetry/bin:$PATH"

# Install system dependencies
RUN apt-get update && \
  apt-get install -y sudo postgresql postgresql-client postgresql-contrib libpq-dev \
  redis-server memcached imagemagick ffmpeg mupdf mupdf-tools libxml2-dev \
  vim git curl pipenv

# Install node
RUN curl -fsSL https://deb.nodesource.com/setup_15.x | bash - && apt-get install -y nodejs

# Install python and poetry
RUN git clone https://github.com/pyenv/pyenv.git ~/.pyenv && \
  pyenv install $PYTHON_VERSION && pyenv global $PYTHON_VERSION
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -

# Install bundler
RUN gem install bundler

# Create the source folder
RUN mkdir -p /code

# Add Makefile
ADD Makefile /code/Makefile

# Add local dependencies
ADD bulletin_board/js-client /code/bulletin_board/js-client
ADD bulletin_board/ruby-client /code/bulletin_board/ruby-client
ADD voting_schemes/dummy/js-adapter /code/voting_schemes/dummy/js-adapter
ADD voting_schemes/dummy/ruby-adapter /code/voting_schemes/dummy/ruby-adapter
ADD voting_schemes/electionguard/js-adapter /code/voting_schemes/electionguard/js-adapter
ADD voting_schemes/electionguard/ruby-adapter /code/voting_schemes/electionguard/ruby-adapter
ADD voting_schemes/electionguard/python-wrapper /code/voting_schemes/electionguard/python-wrapper
ADD voting_schemes/electionguard/python-to-js /code/voting_schemes/electionguard/python-to-js

# Add dependencies manifests
ADD bulletin_board/server/package-lock.json /code/bulletin_board/server/package-lock.json
ADD bulletin_board/server/package.json /code/bulletin_board/server/package.json
ADD bulletin_board/server/Gemfile.lock /code/bulletin_board/server/Gemfile.lock
ADD bulletin_board/server/Gemfile /code/bulletin_board/server/Gemfile

# Install all dependencies
RUN cd /code && make install

# Build all artifacts
RUN cd /code && make build

# Add application source code
ADD bulletin_board/server /code/bulletin_board/server
WORKDIR /code/bulletin_board/server

# Precompile assets
RUN npm install --global yarn
RUN bundle exec rake assets:precompile

# Run rails server
CMD ["bin/rails", "server"]