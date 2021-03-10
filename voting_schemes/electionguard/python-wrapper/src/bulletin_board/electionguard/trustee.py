from electionguard.decryption import compute_decryption_share_for_selection
from electionguard.decryption_share import (
    CiphertextDecryptionContest,
    CiphertextDecryptionSelection,
)
from electionguard.key_ceremony import PublicKeySet
from electionguard.guardian import Guardian
from electionguard.tally import CiphertextTallyContest
from electionguard.types import CONTEST_ID, GUARDIAN_ID, SELECTION_ID
from electionguard.utils import get_optional
from typing import Dict, Set, List, Optional, Literal, Tuple
from .common import Context, ElectionStep, Wrapper, Content
from .messages import (
    TrusteePartialKeys,
    TrusteeVerification,
    JointElectionKey,
    TrusteeShare,
)
from .utils import pair_with_object_id, serialize, deserialize


class TrusteeContext(Context):
    guardian: Guardian
    guardian_id: GUARDIAN_ID
    guardian_ids: Set[GUARDIAN_ID]

    def __init__(self, guardian_id: GUARDIAN_ID) -> None:
        self.guardian_id = guardian_id


class ProcessCreateElection(ElectionStep):
    order: int

    message_type = "create_election"

    def process_message(
        self,
        message_type: Literal["create_election"],
        message: dict,
        context: TrusteeContext,
    ) -> Tuple[List[Content], ElectionStep]:
        context.build_election(message)

        guardian_ids: List[GUARDIAN_ID] = [
            trustee["name"] for trustee in message["trustees"]
        ]
        context.guardian_ids = set(guardian_ids)
        order = guardian_ids.index(context.guardian_id)
        context.guardian = Guardian(
            context.guardian_id, order, context.number_of_guardians, context.quorum
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
                "content": serialize(context.guardian.share_public_keys()),
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
        content = deserialize(message["content"], PublicKeySet)

        if content.owner_id == context.guardian_id:
            self.mine_received = True
        else:
            context.guardian.save_guardian_public_keys(content)

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
                            context.guardian.share_election_partial_key_backup(
                                guardian_id
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
                            context.guardian.verify_election_partial_key_backup(
                                guardian_id
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
        if context.guardian_ids == self.received_verifications:
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
        joint_key = deserialize(message["content"], JointElectionKey)
        context.election_builder.set_public_key(get_optional(joint_key.joint_key))
        context.election_metadata, context.election_context = get_optional(
            context.election_builder.build()
        )
        # TODO: coefficient validation keys???
        # TODO: check joint key, without using private variables if possible
        #         serialize(elgamal_combine_public_keys(context.guardian._guardian_election_public_keys.values()))
        return [], ProcessTallyCast()


class ProcessTallyCast(ElectionStep):
    message_type = "tally.cast"

    def process_message(
        self,
        message_type: Literal["tally.cast"],
        message: Content,
        context: TrusteeContext,
    ) -> Tuple[List[Content], None]:
        contests: Dict[CONTEST_ID, CiphertextDecryptionContest] = {}

        tally_cast: Dict[CONTEST_ID, CiphertextTallyContest] = deserialize(
            message["content"], Dict[CONTEST_ID, CiphertextTallyContest]
        )

        for contest in tally_cast.values():
            selections: Dict[SELECTION_ID, CiphertextDecryptionSelection] = dict(
                pair_with_object_id(
                    compute_decryption_share_for_selection(
                        context.guardian, selection, context.election_context
                    )
                )
                for (_, selection) in contest.tally_selections.items()
            )

            contests[contest.object_id] = CiphertextDecryptionContest(
                contest.object_id,
                context.guardian_id,
                contest.description_hash,
                selections,
            )

        return [
            {
                "message_type": "tally.trustee_share",
                "content": serialize(
                    TrusteeShare(
                        guardian_id=context.guardian_id,
                        public_key=context.guardian.share_election_public_key().key,
                        contests=contests,
                    )
                ),
            }
        ], ProcessEndTally()


class ProcessEndTally(ElectionStep):
    message_type = "end_tally"

    def process_message(
        self, message_type: Literal["end_tally"], message: dict, context: TrusteeContext
    ) -> Tuple[List[Content], ElectionStep]:
        return [], ProcessPublishResults()


class ProcessPublishResults(ElectionStep):
    message_type = "publish_results"

    def process_message(
        self,
        message_type: Literal["publish_results"],
        message: dict,
        context: TrusteeContext,
    ) -> Tuple[List[Content], None]:
        return [], None


class Trustee(Wrapper[TrusteeContext]):
    starting_step = ProcessCreateElection

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
