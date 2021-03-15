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
RUN mkdir -p /code/bulletin_board/tmp

# Install npm dependencies
ADD bulletin_board/server/package-lock.json /code/bulletin_board/tmp/package.json
ADD bulletin_board/server/package.json /code/bulletin_board/tmp/package.json
RUN cd /code/bulletin_board/tmp && npm i

# Add local ruby dependencies
ADD bulletin_board/ruby-client /code/bulletin_board/ruby-client
ADD voting_schemes/dummy/ruby-adapter /code/voting_schemes/dummy/ruby-adapter
ADD voting_schemes/electionguard/ruby-adapter /code/voting_schemes/electionguard/ruby-adapter

# Install ruby dependencies
RUN gem install bundler
ADD bulletin_board/server/Gemfile /code/bulletin_board/tmp/Gemfile
ADD bulletin_board/server/Gemfile.lock /code/bulletin_board/tmp/Gemfile.lock
RUN cd /code/bulletin_board/tmp && bundle install

# Add local python dependencies
ADD voting_schemes/electionguard/python-wrapper /voting_schemes/electionguard/python-wrapper

# Install python dependencies
RUN git clone https://github.com/pyenv/pyenv.git ~/.pyenv
RUN pyenv install $PYTHON_VERSION && pyenv global $PYTHON_VERSION
ADD bulletin_board/server/install_eg_wrappers_no_sudo.sh /code/bulletin_board/tmp/install_eg_wrappers_no_sudo.sh
RUN cd /code/bulletin_board/tmp && ./install_eg_wrappers_no_sudo.sh

# Add application source code
ADD bulletin_board/server /code/bulletin_board/server
RUN cp -r /code/bulletin_board/tmp/node_modules /code/bulletin_board/server
WORKDIR /code/bulletin_board/server

# Precompile assets
RUN npm install --global yarn
RUN bundle exec rake assets:precompile

# Run rails server
CMD ["bin/rails", "server"]