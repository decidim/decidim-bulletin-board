# CONSTANTS

ELECTIONGUARD_PYTHON_VERSION = 1.2.1
ELECTIONGUARD_PYTHON_WRAPPER_VERSION = 0.1.1
ELECTIONGUARD_JAVA_VERSION = 0.9.2

ELECTIONGUARD_PYTHON_PATH = \
	voting_schemes/electionguard/electionguard-python
ELECTIONGUARD_PYTHON_WRAPPER_PATH = \
	voting_schemes/electionguard/python-wrapper
ELECTIONGUARD_PYTHON_TO_JS_PATH = \
	voting_schemes/electionguard/python-to-js
ELECTIONGUARD_JAVA_PATH = \
	voting_schemes/electionguard/verifier/electionguard-java
ELECTIONGUARD_DOCKER_PATH = \
	voting_schemes/electionguard/docker

ELECTIONGUARD_PYTHON_LIBRARY_OUTPUT = \
	${ELECTIONGUARD_PYTHON_PATH}/dist/electionguard-${ELECTIONGUARD_PYTHON_VERSION}.tar.gz
ELECTIONGUARD_PYTHON_WRAPPER_LIBRARY_OUTPUT = \
	${ELECTIONGUARD_PYTHON_WRAPPER_PATH}/dist/bulletin_board-electionguard-${ELECTIONGUARD_PYTHON_WRAPPER_VERSION}.tar.gz
ELECTIONGUARD_PYTHON_TO_JS_LIBRARY_OUTPUT = \
	voting_schemes/electionguard/ruby-adapter/public/assets/electionguard/bulletin_board-electionguard.js

VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_PATH = \
	voting_schemes/electionguard/js-adapter
VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH = \
	voting_schemes/electionguard/ruby-adapter
VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_OUTPUT = \
	voting_schemes/electionguard/ruby-adapter/app/assets/javascripts/voting_schemes/electionguard/electionguard.js

VERIFIER_ELECTIONGUARD_PATH = voting_schemes/electionguard/verifier

DOCKER_BASE_IMAGE = decidim/ruby-node-python-electionguard:ruby-3.1.1-node-16-python-3.8.11-electionguard-${ELECTIONGUARD_PYTHON_VERSION}
DOCKER_PYODIDE_IMAGE = decidim/pyodide-electionguard:pyodide-0.16.1-electionguard-${ELECTIONGUARD_PYTHON_VERSION}

# SPECIFIC TASKS

electionguard_submodules:
	git submodule init && git submodule update

electionguard_docker_base:
	docker image build --build-arg ELECTIONGUARD_PYTHON_REF=${ELECTIONGUARD_PYTHON_VERSION} -t ${DOCKER_BASE_IMAGE} ${ELECTIONGUARD_DOCKER_PATH}/ruby-node-python-electionguard && \
	docker image push ${DOCKER_BASE_IMAGE}

electionguard_docker_pyodide:
	docker image build -t ${DOCKER_PYODIDE_IMAGE} ${ELECTIONGUARD_DOCKER_PATH}/pyodide-electionguard && \
	docker image push ${DOCKER_PYODIDE_IMAGE}


# COMMON TASKS

help_electionguard:
	@echo
	@echo 'Electionguard:'
	@echo '  electionguard_submodules - Fetch missing submodules for electionguard.'
	@echo '  electionguard_docker_base - Build and push the base docker image for electionguard CI and deploy tasks.'
	@echo '  electionguard_docker_pyodide - Build and push the Pyodide docker image for electionguard CI and deploy tasks.'

install_electionguard: install_electionguard_python_wrapper \
		install_voting_scheme_electionguard_js_dependencies \
		install_voting_scheme_electionguard_ruby_dependencies \

clean_electionguard:
	rm -rf ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH}/public
	rm -rf ${ELECTIONGUARD_PYTHON_PATH}/dist
	rm -rf ${ELECTIONGUARD_PYTHON_WRAPPER_PATH}/dist
	rm -rf ${ELECTIONGUARD_PYTHON_TO_JS_PATH}/packages/bulletin_board-electionguard/dist/
	rm -rf ${ELECTIONGUARD_PYTHON_TO_JS_PATH}/packages/electionguard/dist/
	rm -f ${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_OUTPUT}

build_electionguard: ${ELECTIONGUARD_PYTHON_LIBRARY_OUTPUT} \
	build_electionguard_python_wrapper \
	${ELECTIONGUARD_PYTHON_TO_JS_LIBRARY_OUTPUT} \
	${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_OUTPUT} \
	build_voting_scheme_electionguard_ruby_library

test_electionguard: test_voting_scheme_electionguard_js_library \
	test_voting_scheme_electionguard_ruby_library

bump_electionguard: bump_version_voting_scheme_electionguard_js_library \
	bump_version_voting_scheme_electionguard_ruby_library

release_electionguard: release_voting_scheme_electionguard_gem \
	release_voting_scheme_electionguard_package

install_verifier_electionguard:	install_verifier_electionguard_dependencies \
		build_electionguard_java

# SUBTASKS

install_electionguard_python_wrapper:
	cd ${ELECTIONGUARD_PYTHON_WRAPPER_PATH} && make install

install_voting_scheme_electionguard_js_dependencies:
	cd ${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_PATH} && npm i

install_voting_scheme_electionguard_ruby_dependencies:
	cd ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH} && bundle install

${ELECTIONGUARD_PYTHON_LIBRARY_OUTPUT}: ${ELECTIONGUARD_PYTHON_PATH}/src
	cd ${ELECTIONGUARD_PYTHON_PATH} && make build

build_electionguard_python_wrapper: ${ELECTIONGUARD_PYTHON_WRAPPER_LIBRARY_OUTPUT}

${ELECTIONGUARD_PYTHON_WRAPPER_LIBRARY_OUTPUT}: ${ELECTIONGUARD_PYTHON_LIBRARY_OUTPUT} ${ELECTIONGUARD_PYTHON_WRAPPER_PATH}/src
	cd ${ELECTIONGUARD_PYTHON_WRAPPER_PATH} && make package

${ELECTIONGUARD_PYTHON_TO_JS_LIBRARY_OUTPUT}: ${ELECTIONGUARD_PYTHON_LIBRARY_OUTPUT} ${ELECTIONGUARD_PYTHON_WRAPPER_LIBRARY_OUTPUT}
ifndef SKIP_PYODIDE
ifeq (,$(wildcard /.dockerenv))
	mkdir -p /tmp/electionguard && cd ${ELECTIONGUARD_PYTHON_TO_JS_PATH} && ./build /tmp/electionguard
else
	cd ${ELECTIONGUARD_PYTHON_TO_JS_PATH} && ./build
endif
endif

${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_OUTPUT}:
	cd ${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_PATH} && npm run build

build_voting_scheme_electionguard_ruby_library:
	cd ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH} && bundle exec rake build

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

release_voting_scheme_electionguard_gem:
	cd ${VOTING_SCHEME_ELECTIONGUARD_RUBY_LIBRARY_PATH} && \
	gem build voting_schemes-electionguard.gemspec && \
	gem push voting_schemes-electionguard-${VERSION}.gem && \
	rm voting_schemes-electionguard-${VERSION}.gem

release_voting_scheme_electionguard_package:
	cd ${VOTING_SCHEME_ELECTIONGUARD_JS_LIBRARY_PATH} && npm publish --access public

install_verifier_electionguard_dependencies:
	cd ${VERIFIER_ELECTIONGUARD_PATH} && npm i

build_electionguard_java:
	cd ${ELECTIONGUARD_JAVA_PATH} && git apply ../patches/no-ballot-chaining-verifier.patch && ./gradlew fatJar && git reset --hard
