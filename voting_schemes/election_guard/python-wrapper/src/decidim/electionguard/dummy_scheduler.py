from typing import Any, Callable, Iterable, List, TypeVar
from itertools import starmap
from electionguard.singleton import Singleton

_T = TypeVar("_T")


class DummyScheduler(Singleton):
    def schedule(
        self,
        task: Callable,
        arguments: Iterable[Iterable[Any]],
        with_shared_resources: bool = False,
    ) -> List[_T]:
        return list(starmap(task, arguments))
