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
	python -m pip install --upgrade pip
	pip install pipenv
	pipenv install --dev

format:
	pipenv run black .

lint:
	pipenv run flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	pipenv run flake8 . --count --max-complexity=10 --max-line-length=127 --statistics

test: test_integration test_bulletin_board test_trustee test_voter

integration: test_integration
test-integration: test_integration
test_integration:
	pipenv run python -m unittest tests/test_integration.py

bulletin-board: test_bulletin_board
test-bulletin-board: test_bulletin_board
test_bulletin_board:
	pipenv run python -m unittest tests/test_bulletin_board.py

trustee: test_trustee
test-trustee: test_trustee
test_trustee:
	pipenv run python -m unittest tests/test_trustee.py

voter: test_voter
test-voter: test_voter
test_voter:
	pipenv run python -m unittest tests/test_voter.py

package:
	pipenv run python setup.py sdist
