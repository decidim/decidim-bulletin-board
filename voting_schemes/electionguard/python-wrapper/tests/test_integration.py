import json
import asyncio
import pytest
import unittest
from pathlib import Path
from random import choice, sample
from typing import List

from bulletin_board.electionguard.bulletin_board import BulletinBoard
from bulletin_board.electionguard.common import Recorder
from bulletin_board.electionguard.tally_decryptor import TallyResults
from bulletin_board.electionguard.trustee import Trustee
from bulletin_board.electionguard.utils import InvalidBallot
from bulletin_board.electionguard.voter import Voter

from .utils import (
    create_election_test_message_v1,
    create_election_test_message_v2,
    end_vote_message,
    start_tally_message,
    start_vote_message,
)

NUMBER_OF_VOTERS = 10


def display_results(results: TallyResults):
    for question_id, question in results.items():
        print(f"Question {question_id}:")
        for selection_id, tally in question.items():
            print(f"Option {selection_id}: " + str(tally))


class TestIntegration(object):
    @pytest.mark.asyncio
    async def test_complete(self):
        with Recorder(output_path=Path(".") / "integration_results.jsonl") as recorder:
            self.reset_state = False
            self.show_output = True
            self.configure_election(recorder)
            await self.key_ceremony()
            await self.encrypt_ballots(recorder)
            await self.cast_votes()
            await self.decrypt_tally()

    @pytest.mark.asyncio
    async def test_backwards_compatible_ballot_styles(self):
        self.reset_state = True
        self.show_output = False
        self.configure_election(without_style=True)
        await self.key_ceremony()
        await self.encrypt_ballots(without_style=True)
        await self.cast_votes()
        await self.decrypt_tally()

    @pytest.mark.asyncio
    async def test_without_all_trustees(self):
        self.reset_state = False
        self.show_output = True
        self.configure_election()
        await self.key_ceremony()
        await self.encrypt_ballots()
        await self.cast_votes()
        await self.decrypt_tally_without_all_trustees()

    @pytest.mark.asyncio
    async def test_without_state(self):
        self.reset_state = True
        self.show_output = False
        self.configure_election()
        await self.key_ceremony()
        await self.encrypt_ballots()
        await self.cast_votes()
        await self.decrypt_tally()

    async def checkpoint(self, step, output=None):
        if self.show_output:
            if output:
                print("\n____ " + step + " ____")
                # print(repr(output))
                print("‾‾‾‾ " + step + " ‾‾‾‾")
            else:
                print("\n---- " + step + " ----")

        if self.reset_state:
            trustee_backups = [trustee.backup() for trustee in self.trustees]
            self.bulletin_board = BulletinBoard.restore(self.bulletin_board.backup())
            self.trustees = [Trustee.restore(trustee) for trustee in trustee_backups]

    def configure_election(self, recorder=None, without_style=False):
        if without_style:
            self.election_message = create_election_test_message_v1()
        else:
            self.election_message = create_election_test_message_v2()

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

    async def key_ceremony(self):
        self.bulletin_board.process_message("create_election", self.election_message)
        self.bulletin_board.process_message("start_key_ceremony", None)

        for trustee in self.trustees:
            await trustee.process_message("create_election", self.election_message)

        await self.checkpoint("CREATE ELECTION")

        trustees_public_keys = [
            (await trustee.process_message("start_key_ceremony", None))[0]
            for trustee in self.trustees
        ]

        await self.checkpoint("PUBLIC KEYS", trustees_public_keys)

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
                        (await trustee.process_message(
                            public_keys["message_type"], public_keys
                        ))
                        for public_keys in trustees_public_keys
                        for trustee in self.trustees
                    ],
                ),
            )
        )

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
                        await(trustee.process_message(
                            partial_public_keys["message_type"], partial_public_keys
                        ))
                        for partial_public_keys in trustees_partial_public_keys
                        for trustee in self.trustees
                    ],
                ),
            )
        )

        await self.checkpoint("PARTIAL PUBLIC KEYS", trustees_partial_public_keys)

        for trustee_verifications in trustees_verifications:
            res = self.bulletin_board.process_message(
                trustee_verifications["message_type"], trustee_verifications
            )
            if len(res) > 0:
                self.joint_election_key = res[0]

        for verification in trustees_verifications:
            for trustee in self.trustees:
                await trustee.process_message(verification["message_type"], verification)

        await self.checkpoint("VERIFICATIONS", trustees_verifications)

        for trustee in self.trustees:
            assert not await trustee.is_key_ceremony_done()
            await trustee.process_message(
                self.joint_election_key["message_type"], self.joint_election_key
            )
            assert await trustee.is_key_ceremony_done()

        self.bulletin_board.process_message("end_key_ceremony", None)
        await self.checkpoint("JOINT ELECTION KEY", self.joint_election_key)

    async def encrypt_ballots(self, recorder=None, without_style=False):
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

        self.encrypted_ballots: List[str] = []
        ballot = dict()
        for voter in self.voters:
            await voter.process_message("create_election", self.election_message)
            await voter.process_message(
                self.joint_election_key["message_type"], self.joint_election_key
            )
            await voter.process_message("start_vote", start_vote_message())

            ballot = dict(
                (
                    contest["object_id"],
                    sample(contest["selections"], choice(contest["number"])),
                )
                for contest in possible_answers
            )

            if without_style:
                ballot_style = None
            else:
                ballot_style = "madrid"  # can vote on both questions

            auditable_data, encrypted_data = await voter.encrypt(
                ballot, ballot_style=ballot_style
            )
            self.encrypted_ballots.append(encrypted_data)

    async def cast_votes(self):
        self.bulletin_board.process_message("start_vote", start_vote_message())
        await self.checkpoint("START VOTE")

        self.accepted_ballots: List[str] = []

        for encrypted_ballot in self.encrypted_ballots:
            voter_id = json.loads(encrypted_ballot)["object_id"]
            try:
                self.bulletin_board.process_message(
                    "vote.cast", {"content": encrypted_ballot}
                )
                self.accepted_ballots.append(encrypted_ballot)
                await self.checkpoint("BALLOT ACCEPTED " + voter_id, encrypted_ballot)
            except InvalidBallot:
                await self.checkpoint("BALLOT REJECTED " + voter_id)

        self.bulletin_board.process_message("end_vote", end_vote_message())
        await self.checkpoint("END VOTE")

    async def decrypt_tally(self):
        self.bulletin_board.process_message("start_tally", start_tally_message())
        await self.checkpoint("START TALLY")

        self.bulletin_board.add_ballots(self.accepted_ballots)

        tally_cast = self.bulletin_board.get_tally_cast()

        await self.checkpoint("TALLY CAST", tally_cast)

        trustees_shares = [
            (await trustee.process_message(tally_cast["message_type"], tally_cast))[0]
            for trustee in self.trustees
        ]

        await self.checkpoint("TRUSTEE SHARES", trustees_shares)

        end_tally = dict()
        for share in trustees_shares:
            res = self.bulletin_board.process_message(share["message_type"], share)
            if len(res) > 0:
                end_tally: dict = res[0]  # type: ignore

        await self.checkpoint("END TALLY", end_tally)

        for trustee in self.trustees:
            assert await trustee.is_key_ceremony_done()
            assert not await trustee.is_tally_done()
            await trustee.process_message(end_tally["message_type"], end_tally)
            assert await trustee.is_key_ceremony_done()
            assert await trustee.is_tally_done()

        if self.show_output:
            display_results(end_tally["results"])

    async def decrypt_tally_without_all_trustees(self):
        self.bulletin_board.process_message("start_tally", start_tally_message())
        await self.checkpoint("START TALLY")

        for ballot in self.accepted_ballots[0:2]:
            self.bulletin_board.add_ballot(ballot)

        tally_cast = self.bulletin_board.get_tally_cast()

        await self.checkpoint("TALLY CAST", tally_cast)

        # A Trustee will not be there
        missing_trustee = self.trustees.pop()

        trustees_messages = [
            (await trustee.process_message(tally_cast["message_type"], tally_cast))[0]
            for trustee in self.trustees
        ]
        # The authority notifies about a missing guardian in the middle of the messages
        trustees_messages.insert(1, missing_guardian_message(missing_trustee.context.guardian_id))

        await self.checkpoint("TRUSTEE SHARES", trustees_messages)

        all_compensations = []
        for message in trustees_messages:
            self.bulletin_board.process_message(message["message_type"], message)
            for trustee in self.trustees:
                for compensations in (await trustee.process_message(message["message_type"], message)):
                    all_compensations.append(compensations)

        await self.checkpoint("TRUSTEES COMPENSATED", compensations)

        end_tally = dict()
        for compensations in all_compensations:
            res = self.bulletin_board.process_message(
                "tally.compensations", compensations
            )
            if len(res) > 0:
                end_tally: dict = res[0]  # type: ignore

        assert end_tally is not dict(), "Never got the end tally"

        await self.checkpoint("END TALLY", end_tally)

        for trustee in self.trustees:
            assert await trustee.is_key_ceremony_done()
            assert not await trustee.is_tally_done()
            await trustee.process_message(end_tally["message_type"], end_tally)
            assert await trustee.is_key_ceremony_done()
            assert await trustee.is_tally_done()

        if self.show_output:
            display_results(end_tally["results"])