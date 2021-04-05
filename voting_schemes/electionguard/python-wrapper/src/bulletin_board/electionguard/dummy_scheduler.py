from itertools import starmap
from typing import Any, Callable, Iterable, List

from electionguard.singleton import Singleton


class DummyScheduler(Singleton):
    def schedule(
        self,
        task: Callable,
        arguments: Iterable[Iterable[Any]],
        with_shared_resources: bool = False,
    ) -> List[Any]:
        return list(starmap(task, arguments))
