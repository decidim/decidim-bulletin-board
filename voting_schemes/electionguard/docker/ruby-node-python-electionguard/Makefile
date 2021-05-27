ELECTIONGUARD_PYTHON_PATH = \
	voting_schemes/electionguard/electionguard-python

check_electionguard_python_sha:
	@[ "${ELECTIONGUARD_PYTHON_REF}" ] || ( echo ">> ELECTIONGUARD_PYTHON_REF is not set"; exit 1 )

clone_electionguard_python_repository: check_electionguard_python_sha
	if !(test -d "${ELECTIONGUARD_PYTHON_PATH}"); then git clone https://github.com/microsoft/electionguard-python ${ELECTIONGUARD_PYTHON_PATH}; fi

install_electionguard_python_dependencies: clone_electionguard_python_repository
	cd ${ELECTIONGUARD_PYTHON_PATH} && git checkout ${ELECTIONGUARD_PYTHON_REF} && make environment

build_electionguard_python: install_electionguard_python_dependencies
	cd ${ELECTIONGUARD_PYTHON_PATH} && git checkout ${ELECTIONGUARD_PYTHON_REF} && make build