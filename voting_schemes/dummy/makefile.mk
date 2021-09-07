# CONSTANTS

VOTING_SCHEME_DUMMY_JS_LIBRARY_PATH = \
	voting_schemes/dummy/js-adapter
VOTING_SCHEME_DUMMY_RUBY_LIBRARY_PATH = \
	voting_schemes/dummy/ruby-adapter
VOTING_SCHEME_DUMMY_JS_LIBRARY_OUTPUT = \
	voting_schemes/dummy/ruby-adapter/app/assets/javascripts/voting_schemes/dummy/dummy.js

# COMMON TASKS
help_dummy:

install_dummy: install_voting_scheme_dummy_js_dependencies \
	install_voting_scheme_dummy_ruby_dependencies \

clean_dummy:
	rm -f ${VOTING_SCHEME_DUMMY_JS_LIBRARY_OUTPUT}

build_dummy: ${VOTING_SCHEME_DUMMY_JS_LIBRARY_OUTPUT}

test_dummy: test_voting_scheme_dummy_js_library \
	test_voting_scheme_dummy_ruby_library

release_dummy: release_voting_scheme_dummy_gem \
	release_voting_scheme_dummy_package

bump_dummy: bump_version_voting_scheme_dummy_js_library \
		bump_version_voting_scheme_dummy_ruby_library

install_verifier_dummy:

# SUBTASKS

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
	cd ${VOTING_SCHEME_DUMMY_RUBY_LIBRARY_PATH} && \
	gem build voting_schemes-dummy.gemspec && \
	gem push voting_schemes-dummy-${VERSION}.gem && \
	rm voting_schemes-dummy-${VERSION}.gem

release_voting_scheme_dummy_package:
	cd ${VOTING_SCHEME_DUMMY_JS_LIBRARY_PATH} && npm publish --access public
