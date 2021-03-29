#!/bin/bash

# HEROKU_APP_NAME=`heroku apps:create -n -t decidim --region eu --json | jq -r '.name'`

# heroku pipelines:add decidim-bulletin-board-staging -s development -a $HEROKU_APP_NAME

# heroku addons:create heroku-postgresql -a $HEROKU_APP_NAME

# heroku addons:create heroku-redis -a $HEROKU_APP_NAME

heroku config -j -a decidim-bulletin-board-staging | jq -r 'to_entries[] | select(.key != "DATABASE_URL") | select(.key != "REDIS_TLS_URL") | select(.key != "REDIS_URL") | select(.key != "SECRET_KEY_BASE") | "\(.key)=\(.value)"' #| xargs heroku config:set -a $HEROKU_APP_NAME

# cd bulletin_board/server && bundle exec rake secret | xargs -I'{}' heroku config:set -a $HEROKU_APP_NAME SECRET_KEY_BASE={} && cd -

# heroku container:push --recursive -a $HEROKU_APP_NAME

# heroku container:release web release -a $HEROKU_APP_NAME