# end partial tallying
from dataclasses import dataclass
from typing import Dict, List, Literal, Optional, Set, Tuple, Type

from electionguard.decrypt_with_shares import MISSING_GUARDIAN_ID
from electionguard.decryption import (
    compute_compensated_decryption_share,
    compute_decryption_share_for_selection,
)
from electionguard.decryption_share import (
    CiphertextDecryptionContest,
    CiphertextDecryptionSelection,
    CompensatedDecryptionShare,
    DecryptionShare,
)
from electionguard.election import CiphertextElectionContext
from electionguard.election_polynomial import compute_lagrange_coefficient
from electionguard.group import ElementModQ
from electionguard.guardian import Guardian
from electionguard.manifest import InternalManifest
from electionguard.rsa import rsa_decrypt
from electionguard.serializable import Serializable
from electionguard.tally import CiphertextTally, CiphertextTallyContest
from electionguard.types import CONTEST_ID, GUARDIAN_ID, SELECTION_ID
from electionguard.utils import get_optional

from .common import Content, Context, ElectionStep, Wrapper, unwrap
from .messages import (
    Compensation,
    KeyCeremonyResults,
    TrusteeElectionKey,
    TrusteePartialKeys,
    TrusteeVerification,
)
from .utils import deserialize, pair_with_object_id, serialize


class TrusteeContext(Context):
    guardian: Guardian
    guardian_id: GUARDIAN_ID
    guardian_ids: List[GUARDIAN_ID]
    election_metadata: InternalManifest
    election_context: CiphertextElectionContext
    tally: CiphertextTally

    def __init__(self, guardian_id):
        super().__init__()
        self.guardian_id = guardian_id

    def sequence_order(self, guardian_id: GUARDIAN_ID) -> int:
        return self.guardian._backups_to_share.get(
            guardian_id
        ).designated_sequence_order


class ProcessCreateElection(ElectionStep):
    message_type = "create_election"

    def process_message(
        self,
        message_type: Literal["create_election"],
        message: dict,
        context: TrusteeContext,
    ) -> Tuple[List[Content], ElectionStep]:
        context.build_election(message)

        guardian_ids: List[GUARDIAN_ID] = [
            trustee["slug"] for trustee in message["trustees"]
        ]
        context.guardian_ids = guardian_ids
        context.guardian = Guardian(
            context.guardian_id,
            guardian_ids.index(context.guardian_id),
            context.number_of_guardians,
            context.quorum,
        )

        return [], ProcessStartKeyCeremony()


class ProcessStartKeyCeremony(ElectionStep):
    message_type = "start_key_ceremony"

    def process_message(
        self,
        message_type: Literal["start_key_ceremony"],
        _message: Content,
        context: TrusteeContext,
    ) -> Tuple[List[Content], ElectionStep]:
        return [
            {
                "message_type": "key_ceremony.trustee_election_keys",
                "content": serialize(
                    TrusteeElectionKey(
                        public_key_set=context.guardian.share_public_keys(),
                        coefficient_validation_set=context.guardian.share_coefficient_validation_set(),
                    )
                ),
            }
        ], ProcessTrusteeElectionKeys()


class ProcessTrusteeElectionKeys(ElectionStep):
    message_type = "key_ceremony.trustee_election_keys"
    mine_received: bool = False

    def process_message(
        self,
        message_type: Literal["key_ceremony.trustee_election_keys"],
        message: Content,
        context: TrusteeContext,
    ) -> Tuple[List[Content], Optional[ElectionStep]]:
        content = deserialize(message["content"], TrusteeElectionKey)

        if content.public_key_set.owner_id == context.guardian_id:
            self.mine_received = True
        else:
            context.guardian.save_guardian_public_keys(content.public_key_set)

        if not self.mine_received or not context.guardian.all_public_keys_received():
            return [], None

        context.guardian.generate_election_partial_key_backups()

        return [
            {
                "message_type": "key_ceremony.trustee_partial_election_keys",
                "content": serialize(
                    TrusteePartialKeys(
                        guardian_id=context.guardian_id,
                        partial_keys=[
                            unwrap(
                                context.guardian.share_election_partial_key_backup(
                                    guardian_id
                                )
                            )
                            for guardian_id in context.guardian_ids
                            if context.guardian_id != guardian_id
                        ],
                    )
                ),
            }
        ], ProcessTrusteePartialElectionKeys()


class ProcessTrusteePartialElectionKeys(ElectionStep):
    message_type = "key_ceremony.trustee_partial_election_keys"
    mine_received: bool = False

    def process_message(
        self,
        message_type: Literal["key_ceremony.trustee_partial_election_keys"],
        message: Content,
        context: TrusteeContext,
    ) -> Tuple[List[Content], Optional[ElectionStep]]:
        content = deserialize(message["content"], TrusteePartialKeys)
        if content.guardian_id == context.guardian_id:
            self.mine_received = True
        else:
            for partial_keys_backup in content.partial_keys:
                if partial_keys_backup.designated_id == context.guardian_id:
                    context.guardian.save_election_partial_key_backup(
                        partial_keys_backup
                    )

        if (
            not self.mine_received
            or not context.guardian.all_election_partial_key_backups_received()
        ):
            return [], None

        # TODO: check that verifications are OK

        return [
            {
                "message_type": "key_ceremony.trustee_verification",
                "content": serialize(
                    TrusteeVerification(
                        guardian_id=context.guardian_id,
                        verifications=[
                            unwrap(
                                context.guardian.verify_election_partial_key_backup(
                                    guardian_id
                                )
                            )
                            for guardian_id in context.guardian_ids
                            if context.guardian_id != guardian_id
                        ],
                    )
                ),
            }
        ], ProcessTrusteeVerification()


class ProcessTrusteeVerification(ElectionStep):
    received_verifications: Set[GUARDIAN_ID]

    message_type = "key_ceremony.trustee_verification"

    def setup(self):
        self.received_verifications = set()

    def process_message(
        self,
        message_type: Literal["key_ceremony.trustee_verification"],
        message: Content,
        context: TrusteeContext,
    ) -> Tuple[List[Content], Optional[ElectionStep]]:
        content = deserialize(message["content"], TrusteeVerification)
        self.received_verifications.add(content.guardian_id)

        # TODO: everything should be ok
        if set(context.guardian_ids) == self.received_verifications:
            return [], ProcessEndKeyCeremony()
        else:
            return [], None


class ProcessEndKeyCeremony(ElectionStep):
    message_type = "end_key_ceremony"

    def process_message(
        self,
        message_type: Literal["end_key_ceremony"],
        message: Content,
        context: TrusteeContext,
    ) -> Tuple[List[Content], ElectionStep]:
        key_ceremony_results = deserialize(message["content"], KeyCeremonyResults)
        context.election_builder.set_public_key(
            get_optional(key_ceremony_results.election_joint_key.joint_public_key)
        )
        context.election_builder.set_commitment_hash(
            get_optional(key_ceremony_results.election_joint_key.commitment_hash)
        )
        context.election_metadata, context.election_context = get_optional(
            context.election_builder.build()
        )
        # TODO: coefficient validation keys???
        # TODO: check joint key, without using private variables if possible
        #         serialize(elgamal_combine_public_keys(context.guardian._guardian_election_public_keys.values()))
        return [], ProcessTallyCast()


class ProcessTallyCast(ElectionStep[TrusteeContext]):
    message_type = "tally.cast"

    def process_message(
        self,
        message_type: Literal["tally.cast"],
        message: Content,
        context: TrusteeContext,
    ) -> Tuple[List[Content], ElectionStep[TrusteeContext]]:
        contests: Dict[CONTEST_ID, CiphertextDecryptionContest] = {}

        tally_cast: Dict[CONTEST_ID, CiphertextTallyContest] = deserialize(
            message["content"], Dict[CONTEST_ID, CiphertextTallyContest]
        )

        # save for when compensating
        context.tally = CiphertextTally(
            "election-results", context.election_metadata, context.election_context
        )
        context.tally.contests = tally_cast

        for contest in tally_cast.values():
            selections: Dict[SELECTION_ID, CiphertextDecryptionSelection] = dict(
                pair_with_object_id(
                    unwrap(
                        compute_decryption_share_for_selection(
                            context.guardian, selection, context.election_context
                        )
                    )
                )
                for (_, selection) in contest.selections.items()
            )

            contests[contest.object_id] = CiphertextDecryptionContest(
                contest.object_id,
                context.guardian_id,
                contest.description_hash,
                selections,
            )

        tally_share = DecryptionShare(
            context.tally.object_id,
            guardian_id=context.guardian_id,
            public_key=context.guardian.share_election_public_key().key,
            contests=contests,
        )

        return [
            {"message_type": "tally.trustee_share", "content": serialize(tally_share)}
        ], ProcessEndTally()


@dataclass
class Compensator(Serializable):
    context: TrusteeContext
    shares_seen: Dict[GUARDIAN_ID, DecryptionShare]

    def __init__(self, context: TrusteeContext):
        super().__init__()
        self.shares_seen = {}
        self.context = context

    def seen_share(self, share: DecryptionShare):
        self.shares_seen[share.guardian_id] = share

    def compensate(self) -> Compensation:
        comp = Compensation(
            guardian_id=self.context.guardian_id,
            election_public_keys=self.context.guardian._guardian_election_public_keys._store,
            lagrange_coefficient=self._lagrange_coefficient(),
            compensated_decryptions=[
                self._compensated_decryption_share(missing_guardian_id)
                for missing_guardian_id in self._missing_guardian_ids
            ],
        )
        return comp

    @property
    def _missing_guardian_ids(self) -> Set[MISSING_GUARDIAN_ID]:
        return set(self.context.guardian_ids) - set(self.shares_seen.keys())

    def _lagrange_coefficient(self) -> ElementModQ:
        """
        Compute the Lagrange coefficient of our guardian against all the available guardians
        we have seen.
        """
        return compute_lagrange_coefficient(
            self.context.guardian.sequence_order,
            *[  # type: ignore -- library type is wrong....
                self.context.sequence_order(guardian_id)
                for guardian_id in self.shares_seen.keys()
                if guardian_id != self.context.guardian_id
            ],
        )

    def _compensated_decryption_share(
        self, missing_guardian_id: GUARDIAN_ID
    ) -> CompensatedDecryptionShare:
        share = compute_compensated_decryption_share(
            self.context.guardian,
            missing_guardian_id,
            self.context.tally,
            self.context.election_context,
            rsa_decrypt,
        )

        if share is None:
            raise Exception(f"compensation failed for missing: {missing_guardian_id}")
        else:
            return share


class ProcessPublishResults(ElectionStep):
    message_type = "publish_results"

    def process_message(
        self,
        message_type: Literal["publish_results"],
        message: dict,
        context: TrusteeContext,
    ) -> Tuple[List[Content], None]:
        return [], None


class ProcessEndTally(ElectionStep[TrusteeContext]):
    seen_guardians: Set[GUARDIAN_ID]
    compensator: Optional[Compensator]

    def setup(self):
        self.seen_guardians = set()
        self.compensator = None

    def skip_message(self, message_type: str) -> bool:
        return message_type not in [
            "tally.trustee_share",
            "tally.compensate",
            "end_tally",
        ]

    def process_message(
        self,
        message_type: Literal["tally.trustee_share", "tally.compensate", "end_tally"],
        message: Content,
        context: TrusteeContext,
    ) -> Tuple[List[Content], Optional[ElectionStep[TrusteeContext]]]:
        if self.compensator is None:
            self.compensator = Compensator(context)

        if message_type == "end_tally":
            return [], ProcessPublishResults()
        if message_type == "tally.trustee_share":
            # Keep track of other trustee shares in case we're asked to compensate
            content = deserialize(message["content"], DecryptionShare)
            self.compensator.seen_share(content)
            return [], None
        if message_type == "tally.compensate":
            return [
                {
                    "message_type": "tally.compensation",
                    "content": serialize(self.compensator.compensate()),
                }
            ], None

        # that's impossible, pylance
        return [], None


class Trustee(Wrapper[TrusteeContext]):
    starting_step: Type[ElectionStep] = ProcessCreateElection

    def __init__(self, guardian_id: GUARDIAN_ID, recorder=None) -> None:
        super().__init__(
            TrusteeContext(guardian_id), self.starting_step(), recorder=recorder
        )

    def is_key_ceremony_done(self) -> bool:
        return self.step.__class__ in [
            ProcessTallyCast,
            ProcessEndTally,
            ProcessPublishResults,
        ]

    def is_tally_done(self) -> bool:
        return self.step.__class__ in [ProcessPublishResults]
