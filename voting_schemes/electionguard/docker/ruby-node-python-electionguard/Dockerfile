FROM ruby:3.1.1
LABEL author="hola@decidim.org"

ARG ELECTIONGUARD_PYTHON_REF=

ENV ELECTIONGUARD_PYTHON_REF=$ELECTIONGUARD_PYTHON_REF
ENV PYTHON_VERSION=3.8.11
ENV PYTHON_CONFIGURE_OPTS='--enable-shared'
ENV PYENV_ROOT /root/.pyenv
ENV PATH="$HOME/.poetry/bin:$PATH"
ENV PATH $PYENV_ROOT/shims:$PYENV_ROOT/bin:/root/.poetry/bin:$PATH

# Assume yes for all apt-get prompts
RUN echo 'APT::Get::Assume-Yes "true";' > /etc/apt/apt.conf.d/90assume-yes

# Install bundler
RUN gem install bundler

# Install system dependencies
RUN apt-get update --allow-releaseinfo-change && apt-get install -y sudo pipenv git vim curl

# Install python and poetry
RUN git clone https://github.com/pyenv/pyenv.git ~/.pyenv && \
  pyenv install $PYTHON_VERSION && pyenv global $PYTHON_VERSION
RUN curl -sSL https://install.python-poetry.org | python3 -

# Install node
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y nodejs

# Create the source folder
RUN mkdir -p /code

# Add the source files
ADD Makefile /code/Makefile

# Build electionguard
RUN cd /code && make build_electionguard_python
