#!/bin/bash
set -e

cd /code/bulletin_board/server

if [ "$SEED" ]; then
  echo "Setup database..."
  bundle exec rake db:create db:setup db:seed
fi

# Check for pending migrations
if [ -z "$SKIP_MIGRATIONS" ]; then
  bundle exec rails db:migrate
else
  echo "⚠️ Skipping migrations"
fi

# run the command if non-forced sidekiq execution
if [ -z "$RUN_SIDEKIQ" ]; then
  echo "🚀 $@"
  exec "$@"
else
  echo "🚀 Starting Sidekiq"
  bundle exec sidekiq -e ${RACK_ENV:-production} -C config/sidekiq.yml
fi

