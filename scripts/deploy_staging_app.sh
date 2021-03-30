#!/bin/bash

BULLETIN_BOARD_STAGING_APP=decidim-bulletin-board-staging

# Build and push docker image for the web service and release phase
heroku container:push --recursive -a $BULLETIN_BOARD_STAGING_APP

# Release the application
heroku container:release web release -a $BULLETIN_BOARD_STAGING_APP