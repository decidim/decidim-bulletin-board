.PHONY: all install lint test

OS ?= $(shell python -c 'import platform; print(platform.system())')

all: lint test

install:
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
	pipenv run python setup.py install
	pipenv run pytest

package:
	SETUPTOOLS_USE_DISTUTILS=stdlib pipenv run python setup.py sdist bdist_wheel
	pipenv run python setup.py install
	python3 setup.py install

publish:
	python3 -m twine upload --username __token__ --password ${PYPI_TOKEN} dist/*
