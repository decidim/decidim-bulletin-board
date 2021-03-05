from base64 import b64encode, b64decode
from electionguard.group import (
    ElementModP,
    ElementModQ,
    int_to_p_unchecked,
    int_to_q_unchecked,
)
from typing import Union, Final
import electionguard.serializable

old_set_serializers = electionguard.serializable.set_serializers
old_set_deserializers = electionguard.serializable.set_deserializers


def monkey_patch_serialization():
    electionguard.serializable.set_serializers = set_serializers
    electionguard.serializable.set_deserializers = set_deserializers
    # Remove nonces when serializing to JSON
    electionguard.serializable.KEYS_TO_REMOVE += ["nonce"]


# patch from https://github.com/microsoft/electionguard-python/pull/154

ENCODE_THRESHOLD: Final[int] = 100_000_000


def int_to_maybe_base64(i: int) -> Union[str, int]:
    """
    Given a non-negative integer, returns a big-endian base64 encoding of the integer,
    if it's bigger than `ENCODE_THRESHOLD`, otherwise the input integer is returned.
    :param i: any non-negative integer
    :return: a string in base64 or just the input integer, if it's "small".
    """
    assert i >= 0, "int_to_maybe_base64 does not accept negative numbers"

    # Coercing mpz integers to vanilla integers, because we want consistent behavior.
    i = int(i)

    if i < ENCODE_THRESHOLD:
        return i

    # relevant discussion: https://stackoverflow.com/a/12859903/4048276
    b = i.to_bytes((i.bit_length() + 7) // 8, "big") or b"\0"
    return b64encode(b).decode("utf-8")


def maybe_base64_to_int(i: Union[str, int]) -> int:
    """
    Given a maybe-encoded big-endian base64 non-negative integer, or just a regular
    integer, such as might have been returned by `int_to_maybe_base64`, returns
    that integer, decoded.
    :param i: a base64-encoded integer, or just an integer
    :return: an integer
    """

    if isinstance(i, int):
        return i

    b = b64decode(i)
    return int.from_bytes(b, byteorder="big", signed=False)


def set_serializers():
    old_set_serializers()
    electionguard.serializable.set_serializer(
        lambda p, **_: int_to_maybe_base64(p.to_int()), ElementModP
    )
    electionguard.serializable.set_serializer(
        lambda q, **_: int_to_maybe_base64(q.to_int()), ElementModQ
    )
    electionguard.serializable.set_serializer(
        lambda i, **_: int_to_maybe_base64(i), int
    )


def set_deserializers():
    old_set_serializers()
    electionguard.serializable.set_deserializer(
        lambda p, cls, **_: int_to_p_unchecked(maybe_base64_to_int(p)), ElementModP
    )
    electionguard.serializable.set_deserializer(
        lambda q, cls, **_: int_to_q_unchecked(maybe_base64_to_int(q)), ElementModQ
    )

    electionguard.serializable.set_deserializer(
        lambda i, cls, **_: maybe_base64_to_int(i), int
    )
