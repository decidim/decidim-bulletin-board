from electionguard.ballot import (
    PlaintextBallot,
    PlaintextBallotContest,
    PlaintextBallotSelection,
)
from electionguard.encrypt import encrypt_ballot, selection_from
from electionguard.group import ElementModQ, ElementModP
from electionguard.utils import get_optional
from typing import List, Tuple

from .common import Context, ElectionStep, Wrapper, Content
from .messages import JointElectionKey
from .utils import MissingJointKey, deserialize, serialize


class VoterContext(Context):
    joint_key: ElementModP = None


class ProcessCreateElection(ElectionStep):
    message_type = "create_election"

    def process_message(
        self, message_type: str, message: dict, context: VoterContext
    ) -> Tuple[List[Content], ElectionStep]:
        context.build_election(message)
        return [], ProcessEndKeyCeremony()


class ProcessEndKeyCeremony(ElectionStep):
    message_type = "end_key_ceremony"

    def process_message(
        self, message_type: str, message: Content, context: VoterContext
    ) -> Tuple[List[Content], ElectionStep]:
        context.joint_key = deserialize(message["content"], JointElectionKey).joint_key
        context.election_builder.set_public_key(get_optional(context.joint_key))
        context.election_metadata, context.election_context = get_optional(
            context.election_builder.build()
        )
        return [], ProcessStartVote()


class ProcessStartVote(ElectionStep):
    message_type = "start_vote"

    def process_message(
        self, message_type: str, message: Content, context: VoterContext
    ) -> Tuple[List[Content], None]:
        return [], None


class Voter(Wrapper[VoterContext]):
    ballot_id: str

    def __init__(self, ballot_id: str, recorder=None) -> None:
        super().__init__(VoterContext(), ProcessCreateElection(), recorder=recorder)
        self.ballot_id = ballot_id

    def encrypt(self, ballot: dict, deterministic: bool = False) -> dict:
        if not self.context.joint_key:
            raise MissingJointKey()

        ballot_style: str = self.context.election.ballot_styles[0].object_id
        contests: List[PlaintextBallotContest] = []

        for contest in self.context.election_metadata.get_contests_for(ballot_style):
            selections: List[PlaintextBallotSelection] = [
                selection_from(
                    selection, False, selection.object_id in ballot[contest.object_id]
                )
                for selection in contest.ballot_selections
            ]

            contests.append(PlaintextBallotContest(contest.object_id, selections))

        plaintext_ballot = PlaintextBallot(self.ballot_id, ballot_style, contests)

        # TODO: store the audit information somewhere

        encrypted_ballot = serialize(
            encrypt_ballot(
                plaintext_ballot,
                self.context.election_metadata,
                self.context.election_context,
                ElementModQ(0),
                self.context.joint_key if deterministic else None,
                True,
            )
        )
        # TODO: return both auditable and encrypted ballot

        return encrypted_ballot
