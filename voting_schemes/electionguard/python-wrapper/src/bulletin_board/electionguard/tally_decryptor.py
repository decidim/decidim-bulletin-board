from typing import Dict, Set, Tuple

from electionguard.decrypt_with_shares import (
    AVAILABLE_GUARDIAN_ID,
    MISSING_GUARDIAN_ID,
    decrypt_tally
)
from electionguard.decryption import reconstruct_decryption_share
from electionguard.decryption_share import CompensatedDecryptionShare, DecryptionShare
from electionguard.group import ElementModQ
from electionguard.key_ceremony import ElectionPublicKey
from electionguard.tally import CiphertextTally, PlaintextTally, PlaintextTallyContest
from electionguard.types import CONTEST_ID, GUARDIAN_ID, SELECTION_ID

from .messages import Compensation

TallyResults = Dict[CONTEST_ID, Dict[SELECTION_ID, int]]


class TallyDecryptor:
    shares: Dict[GUARDIAN_ID, DecryptionShare]
    compensations: Dict[GUARDIAN_ID, Compensation]

    def __init__(self):
        super(TallyDecryptor).__init__()
        self.shares = dict()
        self.compensations = dict()

    def received_share(self, share: DecryptionShare):
        self.shares[share.guardian_id] = share

    def received_compensation(self, compensation: Compensation):
        self.compensations[compensation.guardian_id] = compensation

    def is_ready_to_decrypt(self, number_of_guardians: int, quorum: int) -> bool:
        """
        Are we ready to decrypt, or are we still waiting
        for trustee shares or compensations for missing trustees?
        """

        return self._all_trustees_present(
            number_of_guardians
        ) or self._quorum_of_trustees_present(quorum)

    def _all_trustees_present(self, number_of_guardians) -> bool:
        return len(self.shares) == number_of_guardians

    def _quorum_of_trustees_present(self, quorum: int) -> bool:
        """
        Do we have enough available trustees, and
        did we receive a compensation from every available trustee?
        """
        return len(self.shares) >= quorum and len(self.compensations.keys()) == len(
            self.shares
        )

    def decrypt_tally(
        self,
        tally: CiphertextTally,
        crypto_extended_base_hash: ElementModQ,
        number_of_guardians: int,
        quorum: int,
    ) -> Tuple[Dict[CONTEST_ID, PlaintextTallyContest], TallyResults]:
        """
        Decrypts the tally. If not all trustees are present, it will attempt to
        compensate for missing trustees with compensations received from the
        available trustees.
        """

        plaintext_tally = None

        if self._all_trustees_present(number_of_guardians):
            plaintext_tally = decrypt_tally(
                tally,
                self.shares,
                crypto_extended_base_hash,
            )
        elif self._quorum_of_trustees_present(quorum):
            missing_guardians = self._missing_guardians()

            missing_decryption_shares = self._reconstruct_decryption_shares(
                tally, missing_guardians
            )

            decryption_shares = self._merge_decryption_shares(missing_decryption_shares)

            plaintext_tally = decrypt_tally(
                tally,
                decryption_shares,
                crypto_extended_base_hash,
            )
        else:
            raise Exception("Not ready to decrypt. Missing trustees or compensations.")

        if plaintext_tally is None:
            raise Exception("Something went wrong when decrypting the tally.")

        return plaintext_tally.contests, self._format_results(plaintext_tally)

    def _missing_guardians(self) -> Dict[MISSING_GUARDIAN_ID, ElectionPublicKey]:
        """
        Returns the trustees that are missing, together with
        their public keys.
        """

        any_available_guardian_id = list(self.shares.keys())[0]  # any will do
        all_election_public_keys = self.compensations[
            any_available_guardian_id
        ].election_public_keys

        missing_guardians: Dict[MISSING_GUARDIAN_ID, ElectionPublicKey] = {
            guardian_id: public_key
            for guardian_id, public_key in all_election_public_keys.items()
            if guardian_id not in self.shares.keys()
        }

        compensated_missing_guardians: Set[MISSING_GUARDIAN_ID] = {
            share.missing_guardian_id
            for available_guardian_id, compensation in self.compensations.items()
            for share in compensation.compensated_decryptions
        }

        if len(compensated_missing_guardians) < len(missing_guardians):
            missing = {
                k
                for k in missing_guardians.keys()
                if k not in compensated_missing_guardians
            }
            raise Exception(f"Missing compensations for some guardians: {missing}")

        return missing_guardians

    def _reconstruct_decryption_shares(
        self,
        tally: CiphertextTally,
        missing_guardians: Dict[MISSING_GUARDIAN_ID, ElectionPublicKey],
    ) -> Dict[MISSING_GUARDIAN_ID, DecryptionShare]:
        """
        Synthesizes decryption shares for missing trustees, using
        the compensations we received from the available trustees.
        """

        missing_guardian_ids = set(missing_guardians.keys())

        lagrange_coefficients = self._extract_lagrange_coefficients(
            missing_guardian_ids
        )
        compensated_decryption_shares = self._extract_compensated_decryption_shares(
            missing_guardian_ids
        )

        missing_decryption_shares: Dict[MISSING_GUARDIAN_ID, DecryptionShare] = dict()

        for missing_guardian_id in missing_guardians.keys():
            missing_decryption_shares[
                missing_guardian_id
            ] = reconstruct_decryption_share(
                missing_guardians[missing_guardian_id],
                tally,
                compensated_decryption_shares[missing_guardian_id],
                lagrange_coefficients[missing_guardian_id],
            )

        if len(missing_decryption_shares) != len(missing_guardians):
            raise Exception(
                "Failed to reconstruct decryption shares for missing trustees"
            )

        return missing_decryption_shares

    def _merge_decryption_shares(
        self, missing_decryption_shares: Dict[MISSING_GUARDIAN_ID, DecryptionShare]
    ) -> Dict[GUARDIAN_ID, DecryptionShare]:
        merged_decryption_shares: Dict[GUARDIAN_ID, DecryptionShare] = {}

        for available, share in self.shares.items():
            merged_decryption_shares[available] = share

        for missing, share in missing_decryption_shares.items():
            merged_decryption_shares[missing] = share

        return merged_decryption_shares

    def _extract_lagrange_coefficients(
        self, missing_guardian_ids: Set[MISSING_GUARDIAN_ID]
    ) -> Dict[MISSING_GUARDIAN_ID, Dict[AVAILABLE_GUARDIAN_ID, ElementModQ]]:
        """
        Permutes received lagrange coefficients from the compensations into
        a usable shape keyed by missing guardian id.
        """

        coeffs: Dict[
            MISSING_GUARDIAN_ID, Dict[AVAILABLE_GUARDIAN_ID, ElementModQ]
        ] = dict()

        for available_guardian_id, compensation in self.compensations.items():
            for share in compensation.compensated_decryptions:
                # skip if the supposedly missing guardian sent the actual share
                if share.missing_guardian_id in missing_guardian_ids:
                    if share.missing_guardian_id not in coeffs.keys():
                        coeffs[share.missing_guardian_id] = {}
                    coeffs[share.missing_guardian_id][
                        available_guardian_id
                    ] = compensation.lagrange_coefficient

        return coeffs

    def _extract_compensated_decryption_shares(
        self, missing_guardian_ids: Set[MISSING_GUARDIAN_ID]
    ) -> Dict[
        MISSING_GUARDIAN_ID, Dict[AVAILABLE_GUARDIAN_ID, CompensatedDecryptionShare]
    ]:
        """
        Permutes received compensated decryption shares coefficients from
        the compensations into a usable shape keyed by missing guardian id.
        """

        shares: Dict[
            MISSING_GUARDIAN_ID,
            Dict[AVAILABLE_GUARDIAN_ID, CompensatedDecryptionShare],
        ] = dict()

        for available_guardian_id, compensation in self.compensations.items():
            for share in compensation.compensated_decryptions:
                # skip if the supposedly missing guardian sent the actual share
                if share.missing_guardian_id in missing_guardian_ids:
                    if share.missing_guardian_id not in shares.keys():
                        shares[share.missing_guardian_id] = {}
                    shares[share.missing_guardian_id][available_guardian_id] = share

        return shares

    def _format_results(self, tally: PlaintextTally) -> TallyResults:
        return {
            contest_id: {
                sel_id: sel.tally for sel_id, sel in contest.selections.items()
            }
            for contest_id, contest in tally.contests.items()
        }
