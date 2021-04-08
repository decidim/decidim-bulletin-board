from typing import Type, TypeVar

from electionguard.serializable import read_json, write_json, write_json_object

from .serializable import monkey_patch_serialization

monkey_patch_serialization()


def serialize(obj, include_private: bool = False) -> str:
    return write_json(obj, not include_private)


def serialize_as_dict(obj, include_private: bool = False) -> object:
    return write_json_object(obj, not include_private)


T = TypeVar("T")


def deserialize(obj: str, type: Type[T]) -> T:
    return read_json(obj, type)


class InvalidElectionDescription(Exception):
    """Exception raised when the election description is invalid."""

    pass


class MissingJointKey(Exception):
    """Exception raised when trying to perform an action that depends on the joint key but it is missing."""

    pass


class InvalidBallot(Exception):
    """Exception raised when the received ballot is not valid."""

    pass


def pair_with_object_id(obj):
    return (obj.object_id, obj)


def remove_nonces(ciphered_ballot):
    ciphered_ballot.nonce = None
    for contest in ciphered_ballot.contests:
        contest.nonce = None
        for ballot_selection in contest.ballot_selections:
            ballot_selection.nonce = None
