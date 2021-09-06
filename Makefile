.PHONY: help install clean build release deploy_staging_app deploy_development_app

help: help_common \
		help_server \
		help_client \
		help_dummy \
		help_electionguard \
		help_verifier

include bulletin_board/server.mk
include bulletin_board/client.mk
include voting_schemes/dummy/makefile.mk
include voting_schemes/electionguard/makefile.mk
include verifier/makefile.mk

install: install_server \
		install_client \
		install_dummy \
		install_electionguard

clean: clean_server \
		clean_client \
		clean_dummy \
		clean_electionguard

build: build_server \
		build_client \
		build_dummy \
		build_electionguard

test: test_server \
 		test_client \
		test_dummy \
		test_electionguard

sync_main:
		git checkout develop && \
			git pull && \
			git checkout main && \
			git pull && \
			git rebase develop && git push

sync_develop:
		git checkout main && \
			git pull && \
			git checkout develop && \
			git pull && \
			git rebase main && git push

release: check_clean_repo \
		check_version \
		bump_versions \
		build \
		check_release_flag \
		update_changelog \
		commit_and_push \
		release_server \
		release_client \
		release_dummy \
		release_electionguard

deploy_login:
	heroku login
	heroku container:login

deploy_development_app:
	./scripts/deploy_development_app.sh

deploy_staging_app: check_main_branch
	./scripts/deploy_staging_app.sh

# SUBTASKS

help_common:
	@echo 'Common tasks:'
	@echo '  install - Install all dependencies.'
	@echo '  build - Compile all artifacts.'
	@echo '  clean - Remove all artifacts from the project.'
	@echo '  test - Run all tests.'
	@echo '  sync_main - Prepare the local repo to perform the release. It pulls the last commits and updates the main branch'
	@echo '  release - Bump versions, commit and push changes to the repository and release gems and packages. Requires clean repository and VERSION set.'
	@echo '  deploy_login - Login to Heroku to be able to deploy the application.'
	@echo '  deploy_staging_app - Deploy the bulletin board staging application. Requires heroku login and must be run in the main branch.'
	@echo '  deploy_development_app - Deploy an application to the staging pipeline in the development stage. Requires heroku login.'

bump_versions: bump_server \
		bump_client \
		bump_dummy \
		bump_electionguard

update_changelog:
	sed -i.bak -E "s/## Unreleased/## Unreleased\n\n## [${VERSION}] - `date +'%Y-%m-%d'`/g" CHANGELOG.md

commit_and_push:
	git commit -am "chore: bump to version ${VERSION}"
	git tag v${VERSION}
	git push --tags origin/main

check_clean_repo:
	git diff --quiet

check_version:
	@[ "${VERSION}" ] || ( echo ">> VERSION is not set"; exit 1 )

check_release_flag:
	@[ "${RELEASE}" ] || ( echo ">> RELEASE is not set"; exit 1 )

check_main_branch:
	@[ "${shell git rev-parse --abbrev-ref HEAD}" = "main" ] || ( echo ">> current branch is not main"; exit 1 )
