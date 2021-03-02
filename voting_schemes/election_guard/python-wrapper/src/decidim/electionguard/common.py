from dataclasses import dataclass
import json
import time
from pathlib import Path
from electionguard.election import (
    CiphertextElectionContext,
    ElectionDescription,
    ElectionType,
    InternalElectionDescription,
)
from electionguard.election_builder import ElectionBuilder
from typing import Generic, List, Optional, Tuple, TypeVar, TypedDict
import logging as log
from .utils import complete_election_description, InvalidElectionDescription

try:
    import cPickle as pickle
except:  # noqa: E722
    import pickle


class Context:
    election: ElectionDescription
    election_builder: ElectionBuilder
    election_metadata: InternalElectionDescription
    election_context: CiphertextElectionContext
    number_of_guardians: int
    quorum: int

    def build_election(self, election_creation: dict):
        self.election = ElectionDescription.from_json_object(
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


@dataclass
class Content(TypedDict):
    content: object


class ElectionStep(Generic[C]):
    message_type: str

    def __init__(self) -> None:
        self.setup()

    def setup(self):
        pass

    def skip_message(self, message_type: str) -> bool:
        return self.message_type != message_type

    def process_message(
        self, message_type: str, message: Content, context: C
    ) -> Tuple[List[Content], Optional[ElectionType]]:
        raise NotImplementedError()


class Recorder:
    def __init__(self, output_path: Path):
        self.output_path = output_path / f"{time.time()}.jsonl"

    def __enter__(self):
        self.file = open(self.output_path, "w")
        return self

    def __exit__(self, type, value, traceback):
        self.file.close()

    def record(
        self,
        wrapper_name: str,
        message_type: str,
        message: Optional[Content],
        result: Optional[Content],
    ):
        json.dump(
            {
                "wrapper": wrapper_name,
                "in": message,
                "message_type": message_type,
                "out": result,
            },
            self.file,
        )
        self.file.write("\n")


class Wrapper(Generic[C]):
    def __init__(
        self, context: C, step: ElectionStep[C], recorder: Optional[Recorder] = None
    ) -> None:
        self.context = context
        self.step = step
        self.recorder = recorder

    def skip_message(self, message_type: str) -> bool:
        return self.step.skip_message(message_type)

    def process_message(self, message_type: str, message: Content) -> Content:
        if self.step.skip_message(message_type):
            log.warning(f"{self.__class__.__name__} skipping message `{message_type}`")
            return

        results, next_step = self.step.process_message(
            message_type, message, self.context
        )

        if self.recorder:
            for result in results:
                self.recorder.record(
                    self.__class__.__name__,
                    message_type=message_type,
                    message=message,
                    result=result,
                )

        if next_step:
            self.step = next_step

        return results

    def is_fresh(self) -> bool:
        return isinstance(self.step, self.starting_step)

    def is_key_ceremony_done(self) -> bool:
        raise NotImplementedError

    def is_tally_done(self) -> bool:
        raise NotImplementedError

    def backup(self) -> str:
        return pickle.dumps(self)

    def restore(backup: str):  # returns an instance of myself
        return pickle.loads(backup)
