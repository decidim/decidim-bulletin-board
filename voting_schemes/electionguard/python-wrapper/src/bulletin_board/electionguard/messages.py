from dataclasses import dataclass
from typing import Dict, List

from electionguard.decrypt_with_shares import AVAILABLE_GUARDIAN_ID, MISSING_GUARDIAN_ID
from electionguard.decryption_share import (
    CiphertextDecryptionContest,
    CompensatedDecryptionShare,
)
from electionguard.election import CiphertextElectionContext, ElectionConstants
from electionguard.group import ElementModP, ElementModQ
from electionguard.guardian import GuardianRecord
from electionguard.key_ceremony import (
    ElectionJointKey,
    ElectionPartialKeyBackup,
    ElectionPartialKeyVerification,
    ElectionPublicKey,
    PublicKeySet,
)
from electionguard.serializable import Serializable
from electionguard.types import CONTEST_ID, GUARDIAN_ID


@dataclass
class TrusteeElectionKey(Serializable):
    public_key_set: PublicKeySet
    guardian_record: GuardianRecord


@dataclass
class TrusteePartialKeys(Serializable):
    guardian_id: GUARDIAN_ID
    partial_keys: List[ElectionPartialKeyBackup]


@dataclass
class TrusteeVerification(Serializable):
    guardian_id: GUARDIAN_ID
    verifications: List[ElectionPartialKeyVerification]


@dataclass
class TrusteeShare(Serializable):
    guardian_id: GUARDIAN_ID
    public_key: ElementModP
    contests: Dict[CONTEST_ID, CiphertextDecryptionContest]


@dataclass
class KeyCeremonyResults(Serializable):
    election_joint_key: ElectionJointKey
    constants: ElectionConstants
    context: CiphertextElectionContext


@dataclass
class Compensations(Serializable):
    guardian_id: AVAILABLE_GUARDIAN_ID
    lagrange_coefficient: ElementModQ
    compensated_decryptions: List[CompensatedDecryptionShare]
    election_public_keys: Dict[MISSING_GUARDIAN_ID, ElectionPublicKey]
