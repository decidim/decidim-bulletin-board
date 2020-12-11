# [Choice] Ruby version: 2, 2.7, 2.6, 2.5
ARG VARIANT=2.6
FROM mcr.microsoft.com/vscode/devcontainers/ruby:${VARIANT}

# Install Rails dependencies
RUN apt-get update && \
    apt-get install -y postgresql-client && \
    apt-get install -y inotify-tools && \
    apt-get install -y vim && \
    apt-get install -y git && \
    apt-get install -y curl && \
    apt-get install -y wget && \
    apt-get install -y rubygems

# Install Nodejs
RUN curl -sL https://deb.nodesource.com/setup_15.x | bash -
RUN apt-get install -y nodejs

# Install Rails
RUN gem install bundler

# Install Yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 1.22.10
