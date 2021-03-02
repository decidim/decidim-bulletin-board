from typing import TypeVar, Type
from electionguard.serializable import write_json_object, write_json, read_json
from .serializable import monkey_patch_serialization


monkey_patch_serialization()


def serialize(obj, include_private: bool = False) -> str:
    return write_json(obj, not include_private)


def serialize_as_dict(obj, include_private: bool = False) -> dict:
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


def complete_election_description(election_description: dict) -> dict:
    complete_description = dict(election_description)
    complete_description.update(
        {
            "contact_information": {
                "address_line": [],
                "name": "Organization name",
                "email": [{"annotation": "contact", "value": "contact@example.org"}],
                "phone": [],
            },
            "election_scope_id": "test-election",
            "type": "special",
            "geopolitical_units": [
                {
                    "object_id": "a-place",
                    "name": "A place",
                    "type": "county",
                    "contact_information": {
                        "address_line": [],
                        "name": "Organization name",
                        "email": [
                            {"annotation": "contact", "value": "contact@example.org"}
                        ],
                    },
                    "phone": [],
                }
            ],
            "parties": [],
            "ballot_styles": [
                {"object_id": "ballot-style", "geopolitical_unit_ids": ["a-place"]}
            ],
        }
    )

    for contest in complete_description["contests"]:
        contest["electoral_district_id"] = "a-place"

    return complete_description
