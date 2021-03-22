# This stage builds the electionguard-python and python-wrapper packages
FROM codegram/ruby-node-python:0.0.1 as electionguard-builder
LABEL author="david@codegram.com"

# Create the source folder
RUN mkdir -p /code

# Add the source files
ADD Makefile /code/Makefile
ADD voting_schemes/electionguard/python-wrapper /code/voting_schemes/electionguard/python-wrapper

# This step builds the electionguard-python package and the python wrapper
RUN cd /code && make build_electionguard_python_wrapper

# This stage builds the pyodide packages for the previous python packages
FROM codegram/electionguard-pyodide-base-packages:0.0.1 as python-to-js-builder
LABEL author="david@codegram.com"

ENV PYODIDE_PACKAGES "electionguard,bulletin_board-electionguard"

# Create the source folder
RUN mkdir -p /code

# Add the source files
COPY --from=electionguard-builder /code/voting_schemes/electionguard /code/voting_schemes/electionguard
ADD voting_schemes/electionguard/python-to-js /code/voting_schemes/electionguard/python-to-js

# Copy packages definitions to the pyodide source folder
RUN cp -r /code/voting_schemes/electionguard/python-to-js/packages/* /src/pyodide/packages

# Copy the python packages
RUN cp -r /code/voting_schemes/electionguard/electionguard-python/dist /src/pyodide/packages/electionguard/dist
RUN cp -r /code/voting_schemes/electionguard/python-wrapper/dist /src/pyodide/packages/bulletin_board-electionguard/dist

# This step compiles both packages using pyodide
RUN make

# Override some files in the pyodide build
RUN cp -rf /code/voting_schemes/electionguard/python-to-js/override/* /src/pyodide/build/

FROM codegram/ruby-node-python:0.0.1
LABEL author="david@codegram.com"

# Environment variables
ENV SECRET_KEY_BASE 1234
ENV RAILS_ENV production

# Install system dependencies
RUN apt-get update && \
  apt-get install -y postgresql postgresql-client postgresql-contrib libpq-dev \
  redis-server memcached imagemagick ffmpeg mupdf mupdf-tools libxml2-dev \
  vim curl

# Create the source folder
RUN mkdir -p /code

# Add Makefile
ADD Makefile /code/Makefile

# Add local dependencies and copy some artifacts from previous stages
ADD bulletin_board/js-client /code/bulletin_board/js-client
ADD bulletin_board/ruby-client /code/bulletin_board/ruby-client
ADD voting_schemes/dummy/js-adapter /code/voting_schemes/dummy/js-adapter
ADD voting_schemes/dummy/ruby-adapter /code/voting_schemes/dummy/ruby-adapter
COPY --from=python-to-js-builder /code/voting_schemes/electionguard /code/voting_schemes/electionguard
ADD voting_schemes/electionguard/js-adapter /code/voting_schemes/electionguard/js-adapter
ADD voting_schemes/electionguard/ruby-adapter /code/voting_schemes/electionguard/ruby-adapter
COPY --from=python-to-js-builder /src/pyodide/build /code/voting_schemes/electionguard/js-adapter/public/assets/electionguard

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