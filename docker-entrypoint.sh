#!/bin/bash
set -e

cd /code/bulletin_board/server

if [ "$SEED" ]; then
  echo "Setup database..."
  bundle exec rake db:create db:setup db:seed
fi

echo "Running Rails server..."
bundle exec rails s