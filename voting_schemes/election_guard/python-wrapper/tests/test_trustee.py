from typing import List
import unittest
from electionguard.elgamal import elgamal_combine_public_keys
from electionguard.key_ceremony import PublicKeySet
from decidim.electionguard.trustee import Trustee
from decidim.electionguard.utils import serialize, deserialize
from decidim.electionguard.common import Content
from .utils import create_election_test_message


class TestTrustee(unittest.TestCase):
    def setUp(self):
        self.trustees = [Trustee("alicia"), Trustee("bob"), Trustee("clara")]

    def test_key_ceremony(self):
        for trustee in self.trustees:
            assert trustee.is_fresh()
            assert not trustee.is_key_ceremony_done()
            trustee.process_message("create_election", create_election_test_message())

        trustees_public_keys: List[Content] = [
            trustee.process_message("start_key_ceremony", None)[0]
            for trustee in self.trustees
        ]

        print("\n---- PUBLIC KEYS ----")
        print(repr(trustees_public_keys))
        print("---- END PUBLIC KEYS ----\n")

        trustees_partial_public_keys = list(
            map(
                lambda x: x[0],
                filter(
                    None,
                    [
                        trustee.process_message(
                            "key_ceremony.trustee_election_keys", public_keys
                        )
                        for public_keys in trustees_public_keys
                        for trustee in self.trustees
                    ],
                ),
            )
        )

        print("\n---- PARTIAL PUBLIC KEYS ----")
        print(repr(trustees_partial_public_keys))
        print("---- END PARTIAL PUBLIC KEYS ----\n")

        trustees_verifications = list(
            map(
                lambda x: x[0],
                filter(
                    None,
                    [
                        trustee.process_message(
                            "key_ceremony.trustee_partial_election_keys",
                            partial_public_keys,
                        )
                        for partial_public_keys in trustees_partial_public_keys
                        for trustee in self.trustees
                    ],
                ),
            )
        )

        print("\n---- VERIFICATIONS ----")
        print(repr(trustees_verifications))
        print("---- END VERIFICATIONS ----\n")

        # Process verifications results
        for verification in trustees_verifications:
            for trustee in self.trustees:
                trustee.process_message(
                    "key_ceremony.trustee_verification", verification
                )

        # Simulate the message from the Bulletin Board
        end_key_ceremony: Content = {
            "content": serialize(
                {
                    "joint_key": elgamal_combine_public_keys(
                        deserialize(
                            public_key["content"], PublicKeySet
                        ).election_public_key
                        for public_key in trustees_public_keys
                    )
                }
            )
        }

        for trustee in self.trustees:
            print(repr(trustee.process_message("end_key_ceremony", end_key_ceremony)))

        for trustee in self.trustees:
            assert trustee.is_key_ceremony_done()

        # TODO: assert ballot keys
        # TODO: assert ballot constests keys
        # TODO: assert ballot selections keys
        # TODO: assert nonces removal
        # TODO: assert number of selections for each contest
        # TODO: assert decryption of the ballot

    def test_restore(self):
        pass
        # TODO: backup and restore a trustee between each step

        # self.trustee = Trustee.restore(trustee_backup())
        # print(trustee_public_keys)


if __name__ == "__main__":
    unittest.main()
