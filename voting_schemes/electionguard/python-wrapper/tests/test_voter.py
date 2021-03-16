import unittest
from .utils import (
    create_election_test_message,
    joint_election_key_test_message,
    deterministic_encrypted_ballot,
    remove_unused,
    joint_election_key_test_number
)
from bulletin_board.electionguard.voter import Voter


class TestVoter(unittest.TestCase):
    def setUp(self):
        self.voter = Voter("a-voter")

    def test_cast_vote(self):
        self.voter.process_message("create_election", create_election_test_message())
        self.voter.process_message(
            "end_key_ceremony", joint_election_key_test_message()
        )

        encrypted_ballot = self.voter.encrypt(
            {
                "question1": ["question1-no-selection"],
                "question2": [
                    "question2-first-project-selection",
                    "question2-fourth-project-selection",
                ],
            }
        )

        print(encrypted_ballot)

        # TODO: assert ballot keys
        # TODO: assert ballot constests keys
        # TODO: assert ballot selections keys
        # TODO: assert nonces removal
        # TODO: assert number of selections for each contest
        # TODO: assert decryption of the ballot

    def test_deterministic(self):
        self.voter.process_message("create_election", create_election_test_message())
        self.voter.process_message(
            "end_key_ceremony", joint_election_key_test_message()
        )

        auditable_data, encrypted_ballot = self.voter.encrypt(
            {
                "question1": ["question1-no-selection"],
                "question2": [
                    "question2-first-project-selection",
                    "question2-fourth-project-selection",
                ],
            },
            master_nonce=joint_election_key_test_number(),
        )

        self.assertEqual(
            remove_unused(encrypted_ballot), deterministic_encrypted_ballot()
        )


if __name__ == "__main__":
    unittest.main()
