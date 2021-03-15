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

# Install system dependencies
RUN apt-get update && \
  apt-get install -y postgresql postgresql-client postgresql-contrib libpq-dev \
  redis-server memcached imagemagick ffmpeg mupdf mupdf-tools libxml2-dev \
  vim git curl

# Install node
RUN curl -fsSL https://deb.nodesource.com/setup_15.x | bash - && apt-get install -y nodejs

# Create the source folder
RUN mkdir -p /code/tmp

# Add local npm dependencies
ADD voting_schemes/dummy/js-adapter /code/voting_schemes/dummy/js-adapter
ADD voting_schemes/electionguard/js-adapter /code/voting_schemes/electionguard/js-adapter

# Install npm dependencies
ADD bulletin_board/server/package-lock.json /code/tmp/package.json
ADD bulletin_board/server/package.json /code/tmp/package.json
RUN cd /code/tmp && npm i

# Add local ruby dependencies
ADD decidim-bulletin_board-ruby /code/decidim-bulletin_board-ruby

# Install ruby dependencies
RUN gem install bundler
ADD bulletin_board/server/Gemfile /code/tmp/Gemfile
ADD bulletin_board/server/Gemfile.lock /code/tmp/Gemfile.lock
RUN cd /code/tmp && bundle install

# Add local python dependencies
ADD voting_schemes/electionguard/python-wrapper /code/voting_schemes/electionguard/python-wrapper

# Install python dependencies
RUN git clone https://github.com/pyenv/pyenv.git ~/.pyenv
RUN pyenv install $PYTHON_VERSION && pyenv global $PYTHON_VERSION
ADD bulletin_board/server/install_eg_wrappers_no_sudo.sh /code/tmp/install_eg_wrappers_no_sudo.sh
RUN cd /code/tmp && ./install_eg_wrappers_no_sudo.sh

# Add application source code
ADD bulletin_board/server /code/bulletin_board/server
RUN cp -r /code/tmp/node_modules /code/bulletin_board/server
WORKDIR /code/bulletin_board/server

# Precompile assets
RUN npm install --global yarn
RUN bundle exec rake assets:precompile

ADD voting_schemes/electionguard/js-adapter/vendor/electionguard /code/bulletin_board/server/public/assets/electionguard

# Run rails server
CMD ["bin/rails", "server"]