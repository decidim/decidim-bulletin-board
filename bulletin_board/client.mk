# CONSTANTS

BULLETIN_BOARD_CLIENT_JS_LIBRARY_PATH = bulletin_board/js-client
BULLETIN_BOARD_CLIENT_RUBY_LIBRARY_PATH = bulletin_board/ruby-client
BULLETIN_BOARD_CLIENT_JS_LIBRARY_OUTPUT = \
	bulletin_board/ruby-client/app/assets/javascripts/decidim/bulletin_board/decidim-bulletin_board.js

# COMMON TASKS

help_client:

install_client: install_bulletin_board_client_js_dependencies \
		install_bulletin_board_client_ruby_dependencies

clean_client:
	rm -f ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_OUTPUT}

build_client: ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_OUTPUT}

test_client: test_bulletin_board_client_js_library \
		test_bulletin_board_client_ruby_library

release_client: release_bulletin_board_client_gem \
		release_bulletin_board_client_package

bump_client: bump_version_bulletin_board_client_js_library \
  	bump_version_bulletin_board_client_ruby_library

# SUBTASKS

install_bulletin_board_client_js_dependencies:
	cd ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_PATH} && npm i

install_bulletin_board_client_ruby_dependencies:
	cd ${BULLETIN_BOARD_CLIENT_RUBY_LIBRARY_PATH} && bundle install

${BULLETIN_BOARD_CLIENT_JS_LIBRARY_OUTPUT}:
	cd ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_PATH} && npm run build

build_bulletin_board_client_ruby_library:
	cd ${BULLETIN_BOARD_CLIENT_RUBY_LIBRARY_PATH} && bundle exec rake build

test_bulletin_board_client_js_library:
	cd ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_PATH} && npm test

test_bulletin_board_client_ruby_library:
	cd ${BULLETIN_BOARD_CLIENT_RUBY_LIBRARY_PATH} && bundle exec rspec

bump_version_bulletin_board_client_js_library:
	cd ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_PATH} && npm version ${VERSION}

bump_version_bulletin_board_client_ruby_library:
	cd ${BULLETIN_BOARD_CLIENT_RUBY_LIBRARY_PATH} && \
	sed -i.bak -E "s/VERSION = \"(.*)\"*/VERSION = \"${VERSION}\"/g" lib/decidim/bulletin_board/version.rb && \
	bundle install

release_bulletin_board_client_gem:
	cd ${BULLETIN_BOARD_CLIENT_RUBY_LIBRARY_PATH} && \
	gem build decidim-bulletin_board.gemspec && \
	gem push decidim-bulletin_board-${VERSION}.gem && \
	rm decidim-bulletin_board-${VERSION}.gem

release_bulletin_board_client_package:
	cd ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_PATH} && npm publish --access public
