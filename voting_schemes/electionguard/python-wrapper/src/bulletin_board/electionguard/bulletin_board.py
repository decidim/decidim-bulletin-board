from typing import Any, Dict, List, Literal, NoReturn, Optional, Set, Tuple, Union

from electionguard.ballot import (
    BallotBoxState,
    CiphertextBallot,
    SubmittedBallot,
    from_ciphertext_ballot,
)
from electionguard.ballot_validator import ballot_is_valid_for_election
from electionguard.data_store import DataStore
from electionguard.decryption_share import DecryptionShare
from electionguard.election import ElectionConstants
from electionguard.key_ceremony import ElectionPublicKey, combine_election_public_keys
from electionguard.tally import CiphertextTally
from electionguard.types import GUARDIAN_ID
from electionguard.utils import get_optional

from .common import Content, Context, ElectionStep, Wrapper
from .dummy_scheduler import DummyScheduler
from .messages import (
    Compensation,
    KeyCeremonyResults,
    TrusteeElectionKey,
    TrusteePartialKeys,
    TrusteeVerification,
)
from .tally_decryptor import TallyDecryptor
from .utils import InvalidBallot, deserialize, serialize


class BulletinBoardContext(Context):
    trustee_election_keys: Dict[GUARDIAN_ID, TrusteeElectionKey]
    tally: CiphertextTally
    decryptor: TallyDecryptor

    def __init__(self):
        super(BulletinBoardContext).__init__()
        self.trustee_election_keys = {}
        self.has_joint_key = False
        self.decryptor = TallyDecryptor()


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

        sorted_trustee_elections_keys = sorted(context.trustee_election_keys.items())

        election_commitments = {
            guardian_id: trustee_election_key.coefficient_validation_set.coefficient_commitments
            for guardian_id, trustee_election_key in sorted_trustee_elections_keys
        }

        election_public_keys: DataStore[GUARDIAN_ID, ElectionPublicKey] = DataStore()
        for guardian_id, trustee_election_key in sorted_trustee_elections_keys:
            election_public_keys.set(
                guardian_id,
                ElectionPublicKey(
                    owner_id=trustee_election_key.public_key_set.owner_id,
                    key=trustee_election_key.public_key_set.election_public_key,
                    proof=trustee_election_key.public_key_set.election_public_key_proof,
                ),
            )

        election_joint_key = combine_election_public_keys(
            election_commitments, election_public_keys
        )
        context.election_builder.set_public_key(
            get_optional(election_joint_key.joint_public_key)
        )
        context.election_builder.set_commitment_hash(
            get_optional(election_joint_key.commitment_hash)
        )
        context.election_metadata, context.election_context = get_optional(
            context.election_builder.build()
        )

        return [
            {
                "message_type": "end_key_ceremony",
                "content": serialize(
                    KeyCeremonyResults(
                        election_joint_key=election_joint_key,
                        constants=ElectionConstants(),
                        context=context.election_context,
                    )
                ),
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
        message: Union[Content, dict],
        context: BulletinBoardContext,
    ) -> Tuple[List[Content], Optional[ElectionStep]]:
        return [], ProcessTrusteeShare()


class ProcessTrusteeShare(ElectionStep[BulletinBoardContext]):
    def skip_message(self, message_type: str):
        return (
            message_type != "tally.trustee_share"
            and message_type != "tally.compensation"
        )

    def process_message(
        self, message_type: str, message: Content, context: BulletinBoardContext
    ) -> Tuple[List[Any], None]:
        if message_type == "tally.trustee_share":
            share = deserialize(message["content"], DecryptionShare)
            context.decryptor.received_share(share)

            if not context.decryptor.is_ready_to_decrypt(
                context.number_of_guardians, context.quorum
            ):
                return [], None

            contests, results = context.decryptor.decrypt_tally(
                context.tally,
                context.election_context.crypto_extended_base_hash,
                context.number_of_guardians,
                context.quorum,
            )

            return [
                {
                    "message_type": "end_tally",
                    "content": serialize(contests),
                    "results": results,
                }
            ], None

        if message_type == "tally.compensation":
            compensation = deserialize(message["content"], Compensation)
            context.decryptor.received_compensation(compensation)

            if not context.decryptor.is_ready_to_decrypt(
                context.number_of_guardians, context.quorum
            ):
                return [], None

            contests, results = context.decryptor.decrypt_tally(
                context.tally,
                context.election_context.crypto_extended_base_hash,
                context.number_of_guardians,
                context.quorum,
            )

            return [
                {
                    "message_type": "end_tally",
                    "content": serialize(contests),
                    "results": results,
                }
            ], None

        # impossible, pylance
        return [], None


class BulletinBoard(Wrapper[BulletinBoardContext]):
    def __init__(self, recorder=None) -> None:
        super().__init__(
            BulletinBoardContext(), ProcessCreateElection(), recorder=recorder
        )

    def add_ballots(self, ballots: List[str]):
        submitted_ballots: List[Tuple[None, SubmittedBallot]] = []
        for ballot in ballots:
            ciphertext_ballot = deserialize(ballot, CiphertextBallot)
            submitted_ballots.append(
                (None, from_ciphertext_ballot(ciphertext_ballot, BallotBoxState.CAST))
            )

        self.context.tally.batch_append(submitted_ballots, DummyScheduler()) # type: ignore

    def add_ballot(self, ballot: str):
        ciphertext_ballot = deserialize(ballot, CiphertextBallot)
        submitted_ballot = from_ciphertext_ballot(
            ciphertext_ballot, BallotBoxState.CAST
        )
        self.context.tally.append(
            submitted_ballot,
            DummyScheduler(), # type: ignore
        )

    def get_tally_cast(self) -> Dict:
        return {
            "message_type": "tally.cast",
            "content": serialize(self.context.tally.contests),
        }
