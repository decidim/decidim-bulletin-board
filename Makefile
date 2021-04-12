help:
	@echo 'Cleaning targets:'
	@echo '  clean - Remove all artifacts from the project.'
	@echo 'Installing dependencies:'
	@echo '  install - Install all dependencies.'
	@echo 'Building artifacts:'
	@echo '  build - Compile all artifacts.'
	@echo 'Testing code:'
	@echo '  test - Run all tests.'
	@echo 'Serve application:'
	@echo '  serve - Starts the bulletin board rails server.'
	@echo '  serve_test - Starts the bulletin board rails server in test mode.'
	@echo 'Releasing packages:'
	@echo '  release - Bump versions, commit and push changes to the repository and release gems and packages. Requires clean repository and VERSION set.'
	@echo 'Deploying applications:'
	@echo '  deploy_staging_app - Deploy the bulletin board staging application. Requires heroku login and must be run in the main branch.'
	@echo '  deploy_development_app - Deploy an application to the staging pipeline in the development stage. Requires heroku login.'
	@echo 'Vendor tasks:'
	@echo '  build_electionguard_python_wrapper - Build the bulletin_board-electionguard python package.'
	@echo '  build_electionguard_python_to_js - Compile the pyodide build including both electionguard-python and bulletin_board-electionguard packages and copy them to the electionguard ruby-adapter.'

.PHONY: clean install build serve test release deploy_staging_app deploy_development_app test_verifier

# CONSTANTS

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

ELECTIONGUARD_PYTHON_WRAPPER_PATH = \
	voting_schemes/electionguard/python-wrapper

ELECTIONGUARD_PYTHON_TO_JS_PATH = \
	voting_schemes/electionguard/python-to-js

ELECTIONGUARD_JAVA_PATH = \
	voting_schemes/electionguard/verifier/electionguard-java

# TASKS

install: install_bulletin_board_server_js_dependencies \
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

build: ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_OUTPUT} \
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
	release_gems_and_packages

bump_versions: bump_version_bulletin_board_client_js_library \
  bump_version_bulletin_board_client_ruby_library \
	bump_version_voting_scheme_dummy_js_library \
	bump_version_voting_scheme_dummy_ruby_library \
	bump_version_voting_scheme_electionguard_js_library \
	bump_version_voting_scheme_electionguard_ruby_library \
	bump_version_bulletin_board_server

update_changelog:
	sed -i.bak -E "s/## Unreleased/## Unreleased\n\n## [${VERSION}] - `date +'%Y-%m-%d'`/g" CHANGELOG.md

commit_and_push:
	git commit -am "chore: bump to version ${VERSION}"
	git tag v${VERSION}
	git push --tags

release_gems_and_packages: release_bulletin_board_client_gem \
	release_bulletin_board_client_package \
	release_voting_scheme_dummy_gem \
	release_voting_scheme_dummy_package \
	release_voting_scheme_electionguard_gem \
	release_voting_scheme_electionguard_package

check_clean_repo:
	git diff --quiet

check_version:
	@[ "${VERSION}" ] || ( echo ">> VERSION is not set"; exit 1 )

check_release_flag:
	@[ "${RELEASE}" ] || ( echo ">> RELEASE is not set"; exit 1 )

check_electionguard_python_submodule_update:
	git submodule init && git submodule update

# BULLETIN BOARD SERVER

install_bulletin_board_server_js_dependencies:
	cd ${BULLETIN_BOARD_SERVER_PATH} && npm i

install_bulletin_board_server_ruby_dependencies:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle install

install_bulletin_board_server_python_dependencies:
	cd ${ELECTIONGUARD_PYTHON_WRAPPER_PATH} && python3 -m pip install cryptography==3.2.1 && python3 setup.py install

test_bulletin_board_server:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle exec rspec && npm run e2e:tests

bump_version_bulletin_board_server:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle

serve:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle exec rails s -P tmp/pids/development.pid

serve_test:
	cd ${BULLETIN_BOARD_SERVER_PATH} && bundle exec rails s -e test -p 5017 -P tmp/pids/test.pid

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
	cd ${BULLETIN_BOARD_CLIENT_RUBY_LIBRARY_PATH} && gem push pkg/decidim-bulletin_board-${VERSION}.gem

release_bulletin_board_client_package:
	cd ${BULLETIN_BOARD_CLIENT_JS_LIBRARY_PATH} && npm publish

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
	cd ${VOTING_SCHEME_DUMMY_RUBY_LIBRARY_PATH} && gem push pkg/voting_schemes-dummy-${VERSION}.gem

release_voting_scheme_dummy_package:
	cd ${VOTING_SCHEME_DUMMY_JS_LIBRARY_PATH} && npm publish

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
	cd ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH} && gem push pkg/voting_schemes-electionguard-${VERSION}.gem

release_voting_scheme_electionguard_package:
	cd ${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_PATH} && npm publish

# ELECTIONGUARD PYTHON WRAPPER

build_electionguard_python_wrapper:
	cd ${ELECTIONGUARD_PYTHON_WRAPPER_PATH} && make package

# ELECTIONGUARD PYTHON TO JS

build_electionguard_python_to_js:
	mkdir -p /tmp/electionguard && cd ${ELECTIONGUARD_PYTHON_TO_JS_PATH} && ./build /tmp/electionguard

# ELECTIONGUARD JAVA

build_electionguard_java:
	cd ${ELECTIONGUARD_JAVA_PATH} && git apply ../patches/no-ballot-chaining-verifier.patch && ./gradlew fatJar && git reset --hard

# VERIFIER

VERIFIER_PATH = verifier
VERIFIER_ELECTIONGUARD_PATH = voting_schemes/electionguard/verifier

install_verifier_electionguard_dependencies:
	cd ${VERIFIER_ELECTIONGUARD_PATH} && npm i

install_verifier_dependencies: install_verifier_electionguard_dependencies build_electionguard_java
	cd ${VERIFIER_PATH} && npm i

test_verifier: install_verifier_dependencies
	cd ${VERIFIER_PATH} && bin/verify test/fixtures/electionguard/election-ok.tar

# DEPLOYMENT

check_main_branch:
	@[ "${shell git rev-parse --abbrev-ref HEAD}" == 'main' ] || ( echo ">> current branch is not main"; exit 1 )

deploy_development_app:
	./scripts/deploy_development_app.sh

deploy_staging_app: check_main_branch
	./scripts/deploy_staging_app.sh