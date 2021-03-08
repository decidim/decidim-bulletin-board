import unittest

from bulletin_board.electionguard.bulletin_board import BulletinBoard
from bulletin_board.electionguard.messages import (
    TrusteePartialKeys,
    TrusteeVerification,
)
from bulletin_board.electionguard.utils import serialize

from .utils import create_election_test_message, trustees_public_keys


class TestBulletinBoard(unittest.TestCase):
    def setUp(self):
        self.bulletin_board = BulletinBoard()

    def test_key_ceremony(self):
        election_message = create_election_test_message()
        self.bulletin_board.process_message("create_election", election_message)
        self.bulletin_board.process_message("start_key_ceremony", None)

        for public_keys in trustees_public_keys():
            self.bulletin_board.process_message(
                "key_ceremony.trustee_election_keys", public_keys
            )

        for trustee in election_message["trustees"]:
            self.bulletin_board.process_message(
                "key_ceremony.trustee_partial_election_keys",
                {
                    "content": serialize(
                        TrusteePartialKeys(guardian_id=trustee["slug"], partial_keys=[])
                    )
                },
            )

        msg = []
        for trustee in election_message["trustees"]:
            msg = self.bulletin_board.process_message(
                "key_ceremony.trustee_verification",
                {
                    "content": serialize(
                        TrusteeVerification(
                            guardian_id=trustee["slug"], verifications=[]
                        )
                    )
                },
            )

        assert msg[0]["message_type"] == "end_key_ceremony"

        # TODO: assert ballot keys
        # TODO: assert ballot constests keys
        # TODO: assert ballot selections keys
        # TODO: assert nonces removal
        # TODO: assert number of selections for each contest
        # TODO: assert decryption of the ballot


if __name__ == "__main__":
    unittest.main()
