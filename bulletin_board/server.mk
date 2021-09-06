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
	@echo '  install_test_e2e - Install dependencies to run E2E tests.'
	@echo '  test_e2e - Run E2E tests.'

install_server: install_bulletin_board_server_ruby_dependencies \
		install_bulletin_board_server_js_dependencies

install_test_e2e: install_test_e2e_deps install_test_e2e_chrome install_test_e2e_chromedriver
	cd ${BULLETIN_BOARD_SERVER_PATH} && npm run e2e:install

install_test_e2e_deps:
	apt-get update && apt-get install -y unzip xvfb libxi6 libgconf-2-4

install_test_e2e_chrome:
	curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add && \
	echo "deb [arch=amd64]  http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list && \
	apt-get -y update && apt-get -y install google-chrome-stable

install_test_e2e_chromedriver:
	wget https://chromedriver.storage.googleapis.com/90.0.4430.24/chromedriver_linux64.zip && unzip chromedriver_linux64.zip && \
	mv chromedriver /usr/bin/chromedriver && chown root:root /usr/bin/chromedriver && chmod +x /usr/bin/chromedriver

clean_server:

build_server:

test_server: test_rails test_e2e

test_rails:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle exec rspec

test_e2e:
	cd ${BULLETIN_BOARD_SERVER_PATH} && npm run e2e:tests -- --browser chrome --headless

pre_release_server:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle exec rails s -P tmp/pids/development.pid &
	sleep 5 && cd ${BULLETIN_BOARD_SERVER_PATH} && \
		bundle exec rake schema:generate && npm run schema:generate && \
		kill -9 $$(cat tmp/pids/development.pid) && rm tmp/pids/development.pid

release_server:
	docker image build -t ${DOCKER_WEB_IMAGE} -f Dockerfile.web . && \
	docker image push ${DOCKER_WEB_IMAGE}

bump_server:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle update decidim-bulletin_board voting_schemes-dummy voting_schemes-electionguard

# SUBTASKS

install_bulletin_board_server_js_dependencies:
	cd ${BULLETIN_BOARD_SERVER_PATH} && npm i

install_bulletin_board_server_ruby_dependencies:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle install
