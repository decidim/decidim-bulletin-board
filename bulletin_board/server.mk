# CONSTANTS

BULLETIN_BOARD_SERVER_PATH = bulletin_board/server
DOCKER_WEB_IMAGE = codegram/decidim-bulletin-board:${VERSION}

# SPECIFIC TASKS

serve:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle exec rails s -P tmp/pids/development.pid

replant_serve:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle exec rails db:seed:replant && bundle exec rails s -P tmp/pids/development.pid

serve_test:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle exec rails s -e test -p 5017 -P tmp/pids/test.pid

# COMMON TASKS

help_server:
	@echo
	@echo 'Server:'
	@echo '  serve - Starts the bulletin board rails server.'
	@echo '  replant_serve - Reseeds the server database and starts the bulletin board rails server.'
	@echo '  serve_test - Starts the bulletin board rails server in test mode.'

install_server: install_bulletin_board_server_ruby_dependencies \
		install_bulletin_board_server_js_dependencies

clean_server:

build_server:

test_server:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle exec rspec && npm run e2e:tests

release_server:
	docker image build -t ${DOCKER_WEB_IMAGE} -f Dockerfile.web . && \
	docker image push ${DOCKER_WEB_IMAGE}

bump_server:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle

# SUBTASKS

install_bulletin_board_server_js_dependencies:
	cd ${BULLETIN_BOARD_SERVER_PATH} && npm i

install_bulletin_board_server_ruby_dependencies:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle install
