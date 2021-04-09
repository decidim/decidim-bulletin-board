.PHONY: all install-mac install-linux install-brew install-apt install-deps lint test test_integration test_bulletin_board test_trustee test_voter package

all: lint test package

install-mac: install-brew install-deps
install-linux: install-apt install-deps

install-brew:
	brew install gmp || true
	brew install mpfr || true
	brew install libmpc || true

install-apt:
	sudo apt-get install libgmp-dev
	sudo apt-get install libmpfr-dev
	sudo apt-get install libmpc-dev

install-deps:
	python3 -m pip install --upgrade pip
	cd ../electionguard-python && make environment build
	pip install pipenv
	PIPENV_VENV_IN_PROJECT=True pipenv install --dev
	python3 -m pip install --user --upgrade twine

format:
	pipenv run black .

typecheck:
	pyright

lint:
	pipenv run flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	pipenv run flake8 . --count --max-complexity=10 --max-line-length=127 --statistics

test:
	pipenv run pytest

package:
	pipenv run python setup.py sdist bdist_wheel

publish:
	python -m twine upload --username __token__ --password ${PYPI_TOKEN} dist/*
