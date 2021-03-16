from collections import defaultdict
from typing import Dict, NoReturn, Optional, Set, Literal, Union, Tuple, List
from electionguard.ballot import (
    CiphertextBallot,
    from_ciphertext_ballot,
    BallotBoxState,
)
from electionguard.ballot_validator import ballot_is_valid_for_election
from electionguard.decrypt_with_shares import decrypt_selection_with_decryption_shares
from electionguard.key_ceremony import combine_election_public_keys, ElectionPublicKey
from electionguard.tally import (
    CiphertextTally,
    PlaintextTallySelection,
    PlaintextTallyContest
)
from electionguard.types import CONTEST_ID, GUARDIAN_ID, SELECTION_ID
from electionguard.utils import get_optional
from .common import Content, Context, ElectionStep, Wrapper
from .messages import (
    TrusteeElectionKey,
    TrusteePartialKeys,
    TrusteeVerification,
    TrusteeShare,
)
from .utils import (
    InvalidBallot,
    serialize,
    deserialize,
)
from .dummy_scheduler import DummyScheduler


class BulletinBoardContext(Context):
    trustee_election_keys: Dict[GUARDIAN_ID, TrusteeElectionKey]
    tally: CiphertextTally
    shares: Dict[GUARDIAN_ID, Dict]

    def __init__(self):
        self.trustee_election_keys = {}
        self.has_joint_key = False
        self.shares = {}


class ProcessCreateElection(ElectionStep):
    message_type = "create_election"

    def process_message(
        self,
        message_type: Literal["create_election"],
        message: dict,
        context: BulletinBoardContext,
    ) -> Tuple[List[Content], ElectionStep]:
        context.build_election(message)
        return [], ProcessStartKeyCeremony()


class ProcessStartKeyCeremony(ElectionStep):
    message_type = "start_key_ceremony"

    def process_message(
        self,
        message_type: Literal["start_key_ceremony"],
        _message: Content,
        context: BulletinBoardContext,
    ) -> Tuple[List[Content], ElectionStep]:
        return [], ProcessTrusteeElectionKeys()


class ProcessTrusteeElectionKeys(ElectionStep):
    message_type = "key_ceremony.trustee_election_keys"

    def process_message(
        self,
        _message_type: Literal["key_ceremony.trustee_election_keys"],
        message: Content,
        context: BulletinBoardContext,
    ) -> Tuple[List[Content], Optional[ElectionStep]]:
        content = deserialize(message["content"], TrusteeElectionKey)
        guardian_id = content.public_key_set.owner_id
        context.trustee_election_keys[guardian_id] = content
        # TO-DO: verify keys?

        if len(context.trustee_election_keys) == context.number_of_guardians:
            return [], ProcessTrusteeElectionPartialKeys()
        else:
            return [], None


class ProcessTrusteeElectionPartialKeys(ElectionStep):
    message_type = "key_ceremony.trustee_partial_election_keys"

    partial_keys_received: Set[GUARDIAN_ID]

    def setup(self):
        self.partial_keys_received = set()

    def process_message(
        self,
        _message_type: Literal["key_ceremony.trustee_partial_election_keys"],
        message: Content,
        context: BulletinBoardContext,
    ) -> Tuple[List[Content], Optional[ElectionStep]]:
        content = deserialize(message["content"], TrusteePartialKeys)
        self.partial_keys_received.add(content.guardian_id)
        # TO-DO: verify partial keys?

        if len(self.partial_keys_received) == context.number_of_guardians:
            return [], ProcessTrusteeVerification()
        else:
            return [], None


class ProcessTrusteeVerification(ElectionStep):
    message_type = "key_ceremony.trustee_verification"

    verifications_received: Set[GUARDIAN_ID]

    def setup(self):
        self.verifications_received = set()

    def process_message(
        self,
        message_type: Literal["key_ceremony.trustee_verification"],
        message: Content,
        context: BulletinBoardContext,
    ) -> Tuple[List[Content], Optional[ElectionStep]]:
        content = deserialize(message["content"], TrusteeVerification)
        self.verifications_received.add(content.guardian_id)
        # TO-DO: check verifications?

        if len(self.verifications_received) < context.number_of_guardians:
            return [], None

        election_commitments = {
            guardian_id: trustee_election_key.coefficient_validation_set.coefficient_commitments
            for guardian_id, trustee_election_key in context.trustee_election_keys.items()
        }

        election_public_keys = {
            guardian_id: ElectionPublicKey(
                owner_id=trustee_election_key.public_key_set.owner_id,
                key=trustee_election_key.public_key_set.election_public_key,
                proof=trustee_election_key.public_key_set.election_public_key_proof
            )
            for guardian_id, trustee_election_key in context.trustee_election_keys.items()
        }

        election_joint_key = combine_election_public_keys(election_commitments, election_public_keys)
        context.election_builder.set_public_key(get_optional(election_joint_key.joint_public_key))
        context.election_builder.set_commitment_hash(get_optional(election_joint_key.commitment_hash))
        context.election_metadata, context.election_context = get_optional(
            context.election_builder.build()
        )
        return [
            {
                "message_type": "end_key_ceremony",
                "content": serialize(election_joint_key)
            }
        ], ProcessStartVote()


class ProcessStartVote(ElectionStep):
    message_type = "start_vote"

    def process_message(
        self,
        message_type: Literal["start_vote"],
        message: dict,
        context: BulletinBoardContext,
    ) -> Tuple[List[Content], ElectionStep]:
        return [], ProcessCastVote()


class ProcessCastVote(ElectionStep):
    def skip_message(self, message_type: str):
        return message_type != "vote.cast" and message_type != "end_vote"

    def process_message(
        self,
        message_type: Literal["vote.cast", "end_vote"],
        message: Union[Content, dict],
        context: BulletinBoardContext,
    ) -> Union[NoReturn, Tuple[List[Content], Optional[ElectionStep]]]:
        if message_type == "end_vote":
            context.tally = CiphertextTally(
                "election-results", context.election_metadata, context.election_context
            )
            return [], ProcessStartTally()

        ballot = deserialize(message["content"], CiphertextBallot)
        if not ballot_is_valid_for_election(
            ballot, context.election_metadata, context.election_context
        ):
            raise InvalidBallot()
        else:
            return [], None


class ProcessStartTally(ElectionStep):
    message_type = "start_tally"

    def process_message(
        self,
        message_type: Literal["start_tally"],
        message: Content,
        context: BulletinBoardContext,
    ) -> Tuple[List[Content], ElectionStep]:
        return [], ProcessTrusteeShare()


class ProcessTrusteeShare(ElectionStep):
    message_type = "tally.trustee_share"

    def process_message(
        self, message_type: str, message: Content, context: BulletinBoardContext
    ) -> Tuple[List[Content], None]:
        content = deserialize(message["content"], TrusteeShare)
        context.shares[content.guardian_id] = content

        if len(context.shares) < context.number_of_guardians:
            return [], None

        tally_shares = self._prepare_shares_for_decryption(context.shares)
        results: Dict[CONTEST_ID, Dict[SELECTION_ID, int]] = {}
        content: Dict[CONTEST_ID, PlaintextTallyContest] = {}

        for contest in context.tally.contests.values():
            results[contest.object_id] = {}
            selections: Dict[SELECTION_ID, PlaintextTallySelection] = {}

            for selection in contest.selections.values():
                selection_results: PlaintextTallySelection = (
                    decrypt_selection_with_decryption_shares(
                        selection,
                        tally_shares[selection.object_id],
                        context.election_context.crypto_extended_base_hash,
                    )
                )
                selections[selection.object_id] = selection_results

                results[contest.object_id][
                    selection.object_id
                ] = selection_results.tally

            content[contest.object_id] = PlaintextTallyContest(
                contest.object_id, selections
            )

        return [{"message_type": "end_tally", "content": serialize(content), "results": results}], None

    def _prepare_shares_for_decryption(self, tally_shares):
        shares = defaultdict(dict)
        for guardian_id, share in tally_shares.items():
            for question_id, question in share.contests.items():
                for selection_id, selection in question.selections.items():
                    shares[selection_id][guardian_id] = (share.public_key, selection)
        return shares


class BulletinBoard(Wrapper[BulletinBoardContext]):
    def __init__(self, recorder=None) -> None:
        super().__init__(
            BulletinBoardContext(), ProcessCreateElection(), recorder=recorder
        )

    def add_ballot(self, ballot: dict):
        ciphertext_ballot = deserialize(ballot, CiphertextBallot)
        self.context.tally.append(
            from_ciphertext_ballot(ciphertext_ballot, BallotBoxState.CAST),
            DummyScheduler(),
        )

    def get_tally_cast(self) -> Dict:
        return {
            "message_type": "tally.cast",
            "content": serialize(self.context.tally.contests),
        }
