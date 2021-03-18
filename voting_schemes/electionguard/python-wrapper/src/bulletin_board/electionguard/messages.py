from dataclasses import dataclass
from electionguard.decryption_share import CiphertextDecryptionContest
from electionguard.election import ElectionConstants, CiphertextElectionContext
from electionguard.group import ElementModP
from electionguard.key_ceremony import (
    CoefficientValidationSet,
    PublicKeySet,
    ElectionJointKey,
    ElectionPartialKeyVerification,
    ElectionPartialKeyBackup,
)
from electionguard.serializable import Serializable
from electionguard.types import CONTEST_ID, GUARDIAN_ID
from typing import Dict, List


@dataclass
class TrusteeElectionKey(Serializable):
    public_key_set: PublicKeySet
    coefficient_validation_set: CoefficientValidationSet


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
