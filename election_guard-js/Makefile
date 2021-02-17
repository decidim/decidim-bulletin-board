.PHONY: all install transpile package

include Makefile.envs

all: build package

install:
	npm install
	pip install transcrypt strip-hints

build:
	bin/create-build ${BUILD_DIR}
	bin/apply-patches

transpile:
	bin/run-transpile

package: transpile
	bin/create-package

dev:
	bin/create-build ${ORIG_DIR}

patches:
	bin/create-patches

clean:
	rm -rf ${BUILD_DIR} ${ORIG_DIR} ${TRANSPILE_DIR}
