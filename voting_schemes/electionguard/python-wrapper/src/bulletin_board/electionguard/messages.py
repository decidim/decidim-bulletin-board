from dataclasses import dataclass
from electionguard.decryption_share import CiphertextDecryptionContest
from electionguard.group import ElementModP
from electionguard.key_ceremony import (
    ElectionPartialKeyVerification,
    ElectionPartialKeyBackup,
)
from electionguard.serializable import Serializable
from electionguard.types import CONTEST_ID, GUARDIAN_ID
from typing import Dict, List


@dataclass
class TrusteePartialKeys(Serializable):
    guardian_id: GUARDIAN_ID
    partial_keys: List[ElectionPartialKeyBackup]


@dataclass
class TrusteeVerification(Serializable):
    guardian_id: GUARDIAN_ID
    verifications: List[ElectionPartialKeyVerification]


@dataclass
class JointElectionKey(Serializable):
    joint_key: ElementModP


@dataclass
class TrusteeShare(Serializable):
    guardian_id: GUARDIAN_ID
    public_key: ElementModP
    contests: Dict[CONTEST_ID, CiphertextDecryptionContest]
