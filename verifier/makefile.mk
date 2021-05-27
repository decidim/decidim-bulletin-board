# CONSTANTS

VERIFIER_PATH = verifier

# SPECIFIC TASKS

install_verifier: install_verifier_dummy \
		install_verifier_electionguard
	cd ${VERIFIER_PATH} && npm i

test_verifier: test_verify_election \
		test_verify_ballot

# COMMON TASKS

help_verifier:
	@echo
	@echo 'Verifiers:'
	@echo '  install_verifier - Install all verifier dependencies.'
	@echo '  test_verifier - Run all verifiers tests.'

# SUBTASKS

test_verify_election: install_verifier
	cd ${VERIFIER_PATH} && node src/index.js test/fixtures/electionguard/election-ok.tar

test_verify_ballot: install_verifier_dependencies
	cd ${VERIFIER_PATH} && node src/index.js test/fixtures/electionguard/ballot-ok.txt
