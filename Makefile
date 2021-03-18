help:
	@echo 'Cleaning targets:'
	@echo '  clean - Remove all artifacts from the project.'
	@echo 'Installing dependencies:'
	@echo '  install - Install all dependencies.'
	@echo 'Building artifacts:'
	@echo '  build - Compile all artifacts.'
	@echo 'Testing code:'
	@echo '  test - Run all tests.'
	@echo 'Releasing packages:'
	@echo '  release - Bump versions, commit and push changes to the repository and release gems. Requires clean repository and VERSION set.'

.PHONY: clean install build test release

# CONSTANTS

ELECTIONGUARD_PYTHON_PATH = \
	voting_schemes/electionguard/electionguard-python

ELECTIONGUARD_PYTHON_WRAPPER_PATH = \
	voting_schemes/electionguard/python-wrapper

ELECTIONGUARD_PYTHON_TO_JS_PATH = \
	voting_schemes/electionguard/python-to-js

BULLETIN_BOARD_SERVER_PATH = bulletin_board/server

BULLETIN_BOARD_CLIENT_JS_LIBRARY_PATH = bulletin_board/js-client
BULLETIN_BOARD_CLIENT_RUBY_LIBRARY_PATH = bulletin_board/ruby-client
BULLETIN_BOARD_CLIENT_JS_LIBRARY_OUTPUT = \
	bulletin_board/ruby-client/app/assets/javascripts/decidim/bulletin_board/decidim-bulletin_board.js

VOTING_SCHEME_DUMMY_JS_LIBRARY_PATH = \
	voting_schemes/dummy/js-adapter
VOTING_SCHEME_DUMMY_RUBY_LIBRARY_PATH = \
	voting_schemes/dummy/ruby-adapter
VOTING_SCHEME_DUMMY_JS_LIBRARY_OUTPUT = \
	voting_schemes/dummy/ruby-adapter/app/assets/javascripts/voting_schemes/dummy/dummy.js

VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_PATH = \
	voting_schemes/electionguard/js-adapter
VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH = \
	voting_schemes/electionguard/ruby-adapter
VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_OUTPUT = \
	voting_schemes/electionguard/ruby-adapter/app/assets/javascripts/voting_schemes/electionguard/electionguard.js

# TASKS

install: install_electionguard_python_dependencies \
	install_bulletin_board_server_js_dependencies \
	install_bulletin_board_server_ruby_dependencies \
	install_bulletin_board_server_python_dependencies \
	install_bulletin_board_client_js_dependencies \
	install_bulletin_board_client_ruby_dependencies \
	install_voting_scheme_dummy_js_dependencies \
	install_voting_scheme_dummy_ruby_dependencies \
	install_voting_scheme_electionguard_js_dependencies \
	install_voting_scheme_electionguard_ruby_dependencies

clean:
	rm -f ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_OUTPUT}
	rm -f ${VOTING_SCHEME_DUMMY_JS_LIBRARY_OUTPUT}
	rm -f ${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_OUTPUT}
	rm -rf ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH}/public
	rm -rf ${ELECTIONGUARD_PYTHON_WRAPPER_PATH}/dist
	rm -rf ${ELECTIONGUARD_PYTHON_TO_JS_PATH}/packages/bulletin_board-electionguard/dist/
	rm -rf ${ELECTIONGUARD_PYTHON_TO_JS_PATH}/packages/electionguard/dist/

build: build_electionguard_python_to_js \
  ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_OUTPUT} \
	${VOTING_SCHEME_DUMMY_JS_LIBRARY_OUTPUT} \
	${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_OUTPUT}

test: test_bulletin_board_server \
	test_bulletin_board_client_js_library \
	test_bulletin_board_client_ruby_library \
	test_voting_scheme_dummy_js_library \
	test_voting_scheme_dummy_ruby_library \
	test_voting_scheme_electionguard_js_library \
	test_voting_scheme_electionguard_ruby_library

release: check_clean_repo \
	check_version \
	bump_versions \
	build_bulletin_board_client_ruby_library \
	build_voting_scheme_dummy_ruby_library \
	build_voting_scheme_electionguard_ruby_library \
	check_release_flag \
	update_changelog \
	commit_and_push \
	release_gems

bump_versions: bump_version_bulletin_board_client_js_library \
  bump_version_bulletin_board_client_ruby_library \
	bump_version_voting_scheme_dummy_js_library \
	bump_version_voting_scheme_dummy_ruby_library \
	bump_version_voting_scheme_electionguard_js_library \
	bump_version_voting_scheme_electionguard_ruby_library

update_changelog:
	sed -i.bak -E "s/## Unreleased/## Unreleased\n\n## [${VERSION}] - `date +'%Y-%m-%d'`/g" CHANGELOG.md

commit_and_push:
	git commit -am "chore: bump to version ${VERSION}"
	git tag v${VERSION}
	git push --tags

release_gems: release_bulletin_board_client_gem \
	release_voting_scheme_dummy_gem \
	release_voting_scheme_electionguard_gem

check_clean_repo:
	git diff --quiet

check_version:
	@[ "${VERSION}" ] || ( echo ">> VERSION is not set"; exit 1 )

check_release_flag:
	@[ "${RELEASE}" ] || ( echo ">> RELEASE is not set"; exit 1 )

check_electionguard_python_submodule_update:
	git submodule init && git submodule update

# ELECTIONGUARD PYTHON

install_electionguard_python_dependencies: check_electionguard_python_submodule_update
	cd ${ELECTIONGUARD_PYTHON_PATH} && make environment

build_electionguard_python: check_electionguard_python_submodule_update
	cd ${ELECTIONGUARD_PYTHON_PATH} && make build

# ELECTIONGUARD PYTHON WRAPPER

build_electionguard_python_wrapper: build_electionguard_python
	cd ${ELECTIONGUARD_PYTHON_WRAPPER_PATH} && make package

# ELECTIONGUARD PYTHON TO JS

build_electionguard_python_to_js:
	mkdir -p /tmp/electionguard && cd ${ELECTIONGUARD_PYTHON_TO_JS_PATH} && ./build /tmp/electionguard

# BULLETIN BOARD SERVER

install_bulletin_board_server_js_dependencies:
	cd ${BULLETIN_BOARD_SERVER_PATH} && npm i

install_bulletin_board_server_ruby_dependencies:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle install

install_bulletin_board_server_python_dependencies: build_electionguard_python_wrapper
	cd ${ELECTIONGUARD_PYTHON_WRAPPER_PATH} && python3 -m pip install cryptography==3.2.1 && python3 setup.py install

test_bulletin_board_server:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle exec rspec && npm run e2e:tests

# BULLETIN BOARD CLIENT

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
	cd ${BULLETIN_BOARD_CLIENT_RUBY_LIBRARY_PATH} && bundle exec rake release:rubygem_push

# VOTING SCHEME DUMMY

install_voting_scheme_dummy_js_dependencies:
	cd ${VOTING_SCHEME_DUMMY_JS_LIBRARY_PATH} && npm i

install_voting_scheme_dummy_ruby_dependencies:
	cd ${VOTING_SCHEME_DUMMY_RUBY_LIBRARY_PATH} && bundle install

${VOTING_SCHEME_DUMMY_JS_LIBRARY_OUTPUT}:
	cd ${VOTING_SCHEME_DUMMY_JS_LIBRARY_PATH} && npm run build

build_voting_scheme_dummy_ruby_library:
	cd ${VOTING_SCHEME_DUMMY_RUBY_LIBRARY_PATH} && bundle exec rake build

test_voting_scheme_dummy_js_library:
	cd ${VOTING_SCHEME_DUMMY_JS_LIBRARY_PATH} && npm test

test_voting_scheme_dummy_ruby_library:
	cd ${VOTING_SCHEME_DUMMY_RUBY_LIBRARY_PATH} && bundle exec rspec

bump_version_voting_scheme_dummy_js_library:
	cd ${VOTING_SCHEME_DUMMY_JS_LIBRARY_PATH} && npm version ${VERSION}

bump_version_voting_scheme_dummy_ruby_library:
	cd ${VOTING_SCHEME_DUMMY_RUBY_LIBRARY_PATH} && \
	sed -i.bak -E "s/VERSION = \"(.*)\"*/VERSION = \"${VERSION}\"/g" lib/voting_schemes/dummy/version.rb && \
	bundle install

release_voting_scheme_dummy_gem:
	cd ${VOTING_SCHEME_DUMMY_RUBY_LIBRARY_PATH} && bundle exec rake release:rubygem_push

# VOTING SCHEME ELECTIONGUARD

install_voting_scheme_electionguard_js_dependencies:
	cd ${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_PATH} && npm i

install_voting_scheme_electionguard_ruby_dependencies:
	cd ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH} && bundle install

${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_OUTPUT}:
	cd ${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_PATH} && npm run build

test_voting_scheme_electionguard_js_library:
	cd ${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_PATH} && npm test

test_voting_scheme_electionguard_ruby_library:
	cd ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH} && bundle exec rspec

bump_version_voting_scheme_electionguard_js_library:
	cd ${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_PATH} && npm version ${VERSION}

bump_version_voting_scheme_electionguard_ruby_library:
	cd ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH} && \
	sed -i.bak -E "s/VERSION = \"(.*)\"*/VERSION = \"${VERSION}\"/g" lib/voting_schemes/electionguard/version.rb && \
	bundle install

build_voting_scheme_electionguard_ruby_library:
	cd ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH} && bundle exec rake build

release_voting_scheme_electionguard_gem:
	cd ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH} && bundle exec rake release:rubygem_push