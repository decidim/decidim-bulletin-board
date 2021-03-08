from __future__ import annotations

import json
import logging as log
from pathlib import Path
from typing import Generic, List, Optional, Tuple, Type, TypedDict, TypeVar

from electionguard.election import CiphertextElectionContext
from electionguard.election_builder import ElectionBuilder
from electionguard.manifest import InternalManifest, Manifest

from .utils import InvalidElectionDescription, complete_election_description

try:
    import cPickle as pickle  # type: ignore
except:  # noqa: E722
    import pickle


X = TypeVar("X")


def unwrap(x: Optional[X], message="You messed up") -> X:
    if x is None:
        raise Exception(message)
    return x


class Context:
    election: Manifest
    election_builder: ElectionBuilder
    election_metadata: InternalManifest
    election_context: CiphertextElectionContext
    number_of_guardians: int
    quorum: int

    def build_election(self, election_creation: dict):
        self.election = Manifest.from_json_object(
            complete_election_description(election_creation["description"])
        )

        if not self.election.is_valid():
            raise InvalidElectionDescription()

        self.number_of_guardians = len(election_creation["trustees"])
        self.quorum = election_creation["scheme"]["quorum"]
        self.election_builder = ElectionBuilder(
            self.number_of_guardians, self.quorum, self.election
        )


C = TypeVar("C", bound=Context)


class Message(TypedDict):
    message_type: str


class Content(Message):
    content: str


class ElectionStep(Generic[C]):
    message_type: str

    def __init__(self) -> None:
        self.setup()

    def setup(self):
        pass

    def skip_message(self, message_type: str) -> bool:
        return self.message_type != message_type

    def process_message(
        self, message_type: str, message: Optional[Message] | dict, context: C
    ) -> Tuple[List[Message], Optional[ElectionStep]]:
        raise NotImplementedError()


class Recorder:
    def __init__(self, output_path: str | Path):
        self.output_path = output_path

    def __enter__(self):
        self.file = open(self.output_path, "w")
        return self

    def __exit__(self, type, value, traceback):
        self.file.close()

    def record(
        self,
        wrapper_name: str,
        message_type: str,
        message: Optional[Message | dict],
        responses: List[Message],
    ):
        json.dump(
            {
                "wrapper": wrapper_name,
                "in": message,
                "message_type": message_type,
                "out": responses,
            },
            self.file,
        )
        self.file.write("\n")


T = TypeVar("T", bound="Wrapper")


class Wrapper(Generic[C]):
    starting_step: Optional[ElectionStep[C]] = None

    def __init__(
        self, context: C, step: ElectionStep[C], recorder: Optional[Recorder] = None
    ) -> None:
        self.context = context
        self.step = step
        self.recorder = recorder

    def skip_message(self, message_type: str) -> bool:
        return self.step.skip_message(message_type)

    def process_message(
        self, message_type: str, message: Optional[Message] | dict
    ) -> List[Message]:
        if self.step.skip_message(message_type):
            log.warning(f"{self.__class__.__name__} skipping message `{message_type}`")
            return []

        responses, next_step = self.step.process_message(
            message_type, message, self.context
        )

        if self.recorder:
            self.recorder.record(
                self.__class__.__name__,
                message_type=message_type,
                message=message,
                responses=responses,
            )

        if next_step:
            self.step = next_step

        return responses

    def is_fresh(self) -> bool:
        return type(self.step) is self.__class__.starting_step

    def is_key_ceremony_done(self) -> bool:
        raise NotImplementedError

    def is_tally_done(self) -> bool:
        raise NotImplementedError

    def backup(self) -> bytes:
        return pickle.dumps(self)

    @classmethod
    def restore(cls: Type[T], backup: bytes) -> T:
        return pickle.loads(backup)
