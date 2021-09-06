#!/bin/bash
set -e

cd /code/bulletin_board/server

echo "Running Sidekiq..."
bundle exec sidekiq -e ${RACK_ENV:-production} -C config/sidekiq.yml