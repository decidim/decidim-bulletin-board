ELECTIONGUARD_PYTHON_PATH = \
	voting_schemes/electionguard/electionguard-python

clone_electionguard_python_repository:
	if !(test -d "${ELECTIONGUARD_PYTHON_PATH}"); then git clone https://github.com/microsoft/electionguard-python ${ELECTIONGUARD_PYTHON_PATH}; fi

install_electionguard_python_dependencies: clone_electionguard_python_repository
	cd ${ELECTIONGUARD_PYTHON_PATH} && make environment

build_electionguard_python: install_electionguard_python_dependencies
	cd ${ELECTIONGUARD_PYTHON_PATH} && make build