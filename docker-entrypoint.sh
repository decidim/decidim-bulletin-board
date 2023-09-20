#!/bin/bash
set -e

cd /code/bulletin_board/server

if [ "$SEED" ]; then
  echo "Setup database..."
  bundle exec rake db:create db:setup db:seed
fi

# Check no migrations are pending migrations
if [ -z "$SKIP_MIGRATIONS" ]; then
  bundle exec rails db:migrate
else
  echo "⚠️ Skipping migrations"
fi

echo "🚀 $@"
exec "$@"
