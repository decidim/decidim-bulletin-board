from typing import List
import unittest
from random import choice, sample
import json
from pathlib import Path
from electionguard.ballot import CiphertextBallot
from bulletin_board.electionguard.bulletin_board import BulletinBoard
from bulletin_board.electionguard.common import Recorder
from bulletin_board.electionguard.trustee import Trustee
from bulletin_board.electionguard.voter import Voter
from bulletin_board.electionguard.utils import InvalidBallot
from .utils import (
    create_election_test_message,
    start_vote_message,
    end_vote_message,
    start_tally_message,
)


NUMBER_OF_VOTERS = 10


class TestIntegration(unittest.TestCase):
    def test_complete(self):
        out = Path("./integration_results")
        out.mkdir(parents=True, exist_ok=True)
        with Recorder(output_path=out) as recorder:
            self.reset_state = False
            self.show_output = True
            self.configure_election(recorder)
            self.key_ceremony()
            self.encrypt_ballots(recorder)
            self.cast_votes()
            self.decrypt_tally()
            self.publish_and_verify()

    def test_without_state(self):
        self.reset_state = True
        self.show_output = False
        self.configure_election()
        self.key_ceremony()
        self.encrypt_ballots()
        self.cast_votes()
        self.decrypt_tally()
        self.publish_and_verify()

    def checkpoint(self, step, output=None):
        if self.show_output:
            if output:
                print("\n____ " + step + " ____")
                print(repr(output))
                print("‾‾‾‾ " + step + " ‾‾‾‾")
            else:
                print("\n---- " + step + " ----")

        if self.reset_state:
            self.bulletin_board = self.bulletin_board.backup()
            self.trustees = [trustee.backup() for trustee in self.trustees]
            self.bulletin_board = BulletinBoard.restore(self.bulletin_board)
            self.trustees = [Trustee.restore(trustee) for trustee in self.trustees]

    def configure_election(self, recorder=None):
        self.election_message = create_election_test_message()
        self.bulletin_board = BulletinBoard(recorder=recorder)
        self.trustees = [
            Trustee("alicia", recorder=recorder),
            Trustee("bob", recorder=recorder),
            Trustee("clara", recorder=recorder),
        ]
        self.voters = [
            Voter(f"the-voter-{i}", recorder=recorder)
            for i in range(1, NUMBER_OF_VOTERS)
        ]

    def key_ceremony(self):
        self.bulletin_board.process_message("create_election", self.election_message)
        self.bulletin_board.process_message("start_key_ceremony", None)

        for trustee in self.trustees:
            trustee.process_message("create_election", self.election_message)

        trustees_public_keys = [
            trustee.process_message("start_key_ceremony", None)[0]
            for trustee in self.trustees
        ]

        self.checkpoint("CREATE ELECTION")

        for public_keys in trustees_public_keys:
            self.bulletin_board.process_message(
                public_keys["message_type"], public_keys
            )

        trustees_partial_public_keys = list(
            map(
                lambda x: x[0],
                filter(
                    None,
                    [
                        trustee.process_message(
                            public_keys["message_type"], public_keys
                        )
                        for public_keys in trustees_public_keys
                        for trustee in self.trustees
                    ],
                ),
            )
        )

        self.checkpoint("PUBLIC KEYS", trustees_public_keys)

        for partial_public_keys in trustees_partial_public_keys:
            self.bulletin_board.process_message(
                partial_public_keys["message_type"], partial_public_keys
            )

        trustees_verifications = list(
            map(
                lambda x: x[0],
                filter(
                    None,
                    [
                        trustee.process_message(
                            partial_public_keys["message_type"], partial_public_keys
                        )
                        for partial_public_keys in trustees_partial_public_keys
                        for trustee in self.trustees
                    ],
                ),
            )
        )

        self.checkpoint("PARTIAL PUBLIC KEYS", trustees_partial_public_keys)

        for trustee_verifications in trustees_verifications:
            res = self.bulletin_board.process_message(
                trustee_verifications["message_type"], trustee_verifications
            )
            if len(res) > 0:
                self.joint_election_key = res[0]

        for verification in trustees_verifications:
            for trustee in self.trustees:
                trustee.process_message(verification["message_type"], verification)

        self.checkpoint("VERIFICATIONS", trustees_verifications)

        for trustee in self.trustees:
            assert not trustee.is_key_ceremony_done()
            trustee.process_message(
                self.joint_election_key["message_type"], self.joint_election_key
            )
            assert trustee.is_key_ceremony_done()

        self.bulletin_board.process_message("end_key_ceremony", None)
        self.checkpoint("JOINT ELECTION KEY", self.joint_election_key)

    def encrypt_ballots(self, recorder=None):
        possible_answers = [
            {
                "object_id": contest["object_id"],
                "number": range(
                    contest["minimum_elected"], contest["number_elected"] + 1
                ),
                "selections": [
                    selection["object_id"] for selection in contest["ballot_selections"]
                ],
            }
            for contest in self.election_message["description"]["contests"]
        ]

        self.encrypted_ballots: List[CiphertextBallot] = []
        for voter in self.voters:
            voter.process_message("create_election", self.election_message)
            voter.process_message(
                self.joint_election_key["message_type"], self.joint_election_key
            )
            voter.process_message("start_vote", start_vote_message())

            ballot = dict(
                (
                    contest["object_id"],
                    sample(contest["selections"], choice(contest["number"])),
                )
                for contest in possible_answers
            )
            auditable_data, encrypted_data = voter.encrypt(ballot)
            self.encrypted_ballots.append(encrypted_data)

    def cast_votes(self):
        self.bulletin_board.process_message("start_vote", start_vote_message())
        self.checkpoint("START VOTE")

        self.accepted_ballots: List[CiphertextBallot] = []

        for encrypted_ballot in self.encrypted_ballots:
            voter_id = json.loads(encrypted_ballot)["object_id"]
            try:
                self.bulletin_board.process_message(
                    "vote.cast", {"content": encrypted_ballot}
                )
                self.accepted_ballots.append(encrypted_ballot)
                self.checkpoint("BALLOT ACCEPTED " + voter_id, encrypted_ballot)
            except InvalidBallot:
                self.checkpoint("BALLOT REJECTED " + voter_id)

        self.bulletin_board.process_message("end_vote", end_vote_message())
        self.checkpoint("END VOTE")

    def decrypt_tally(self):
        self.bulletin_board.process_message("start_tally", start_tally_message())
        self.checkpoint("START TALLY")

        for ballot in self.accepted_ballots:
            self.bulletin_board.add_ballot(ballot)

        tally_cast = self.bulletin_board.get_tally_cast()

        self.checkpoint("TALLY CAST", tally_cast)

        trustees_shares = [
            trustee.process_message(tally_cast["message_type"], tally_cast)[0]
            for trustee in self.trustees
        ]

        self.checkpoint("TRUSTEE SHARES", trustees_shares)

        for share in trustees_shares:
            res = self.bulletin_board.process_message(share["message_type"], share)
            if len(res) > 0:
                end_tally = res[0]

        self.checkpoint("END TALLY", end_tally)

        for trustee in self.trustees:
            assert trustee.is_key_ceremony_done()
            assert not trustee.is_tally_done()
            trustee.process_message(end_tally["message_type"], end_tally)
            assert trustee.is_key_ceremony_done()
            assert trustee.is_tally_done()

        if self.show_output:
            for question_id, question in end_tally["results"].items():
                print(f"Question {question_id}:")
                for selection_id, tally in question.items():
                    print(f"Option {selection_id}: " + str(tally))

    def publish_and_verify(self):
        # see publish.py
        pass


if __name__ == "__main__":
    unittest.main()
