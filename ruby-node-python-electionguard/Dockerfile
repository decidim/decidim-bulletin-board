FROM ruby:2.6.6
LABEL author="david@codegram.com"

ARG ELECTIONGUARD_PYTHON_SHA=
ARG DEBIAN_FRONTEND=noninteractive

ENV ELECTIONGUARD_PYTHON_SHA=$ELECTIONGUARD_PYTHON_SHA
ENV PYTHON_VERSION=3.8.8
ENV PYTHON_CONFIGURE_OPTS='--enable-shared'
ENV PYENV_ROOT /root/.pyenv
ENV PATH="$HOME/.poetry/bin:$PATH"
ENV PATH $PYENV_ROOT/shims:$PYENV_ROOT/bin:/root/.poetry/bin:$PATH

# Install bundler
RUN gem install bundler

# Install system dependencies
RUN apt-get update && apt-get install -y sudo pipenv git vim curl

# Install python and poetry
RUN git clone https://github.com/pyenv/pyenv.git ~/.pyenv && \
  pyenv install $PYTHON_VERSION && pyenv global $PYTHON_VERSION
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -

# Install node
RUN curl -fsSL https://deb.nodesource.com/setup_15.x | bash - && apt-get install -y nodejs

# Create the source folder
RUN mkdir -p /code

# Add the source files
ADD Makefile /code/Makefile

# Build electionguard
RUN cd /code && make build_electionguard_python