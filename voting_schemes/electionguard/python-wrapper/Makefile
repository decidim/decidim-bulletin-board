.PHONY: all install lint test

OS ?= $(shell python -c 'import platform; print(platform.system())')

all: lint test

install:
	python3 -m pip install --upgrade pip
	cd ../electionguard-python && make environment build
	pip install pipenv
	PIPENV_VENV_IN_PROJECT=True python3 -m pipenv install --dev
	python3 -m pip install --user --upgrade twine

format:
	python3 -m pipenv run black .

typecheck:
	pyright

lint:
	python3 -m pipenv run flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	python3 -m pipenv run flake8 . --count --max-complexity=10 --max-line-length=127 --statistics

test:
	python3 -m pipenv run python setup.py install
	python3 -m pipenv run pytest

package:
	python3 -m pipenv run python setup.py sdist bdist_wheel
	python3 -m pipenv run python setup.py install
	python3 setup.py install

publish:
	python3 -m twine upload --username __token__ --password ${PYPI_TOKEN} dist/*
