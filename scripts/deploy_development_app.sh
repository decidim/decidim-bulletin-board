#!/bin/bash

BULLETIN_BOARD_STAGING_PIPELINE=decidim-bulletin-board-staging
BULLETIN_BOARD_STAGING_APP=decidim-bulletin-board-staging

# Create heroku application and store the app name in a variable
HEROKU_APP_NAME=`heroku apps:create -n -t decidim --region eu --json | jq -r '.name'`

# Add the heroku application to the pipeline in the development stage
heroku pipelines:add $BULLETIN_BOARD_STAGING_PIPELINE -s development -a $HEROKU_APP_NAME

# Add postgres and redis to the heroku application
heroku addons:create heroku-postgresql -a $HEROKU_APP_NAME
heroku addons:create heroku-redis -a $HEROKU_APP_NAME

# Copy environment variables from staging app excluding some of them
heroku config -j -a $BULLETIN_BOARD_STAGING_APP | jq -r 'to_entries[] | select(.key != "DATABASE_URL") | select(.key != "REDIS_TLS_URL") | select(.key != "REDIS_URL") | select(.key != "SECRET_KEY_BASE") | "\(.key)=\(.value)"' | sed -E "s/=(.*)\$/='\1'/g" | xargs heroku config:set -a $HEROKU_APP_NAME

# Generate a SECRET_KEY_BASE for the new app
cd bulletin_board/server && bundle exec rake secret | xargs -I'{}' heroku config:set -a $HEROKU_APP_NAME SECRET_KEY_BASE={} && cd -

# Build and push docker image for the web service and release phase
heroku container:push --recursive -a $HEROKU_APP_NAME

# Release the application
heroku container:release web release -a $HEROKU_APP_NAME