"""
Priority-Queued Event Dispatcher (v12)
Manages event subscription, priority-ordered execution queues, and dispatching.
"""
import heapq
from models.types import SimulationEvent
from models.enums import EventPriority

class EventDispatcher:
    def __init__(self):
        self._queue: list[tuple[int, int, SimulationEvent]] = [] # (priority_val, counter, event)
        self._counter = 0
        self._handlers: dict[str, list] = {}

    def emit(self, event: SimulationEvent):
        priority_val = event.priority.value
        self._counter += 1
        heapq.heappush(self._queue, (priority_val, self._counter, event))

    def subscribe(self, event_id: str, handler):
        if event_id not in self._handlers:
            self._handlers[event_id] = []
        self._handlers[event_id].append(handler)

    def process_queue(self) -> list[SimulationEvent]:
        processed = []
        while self._queue:
            _, _, event = heapq.heappop(self._queue)
            processed.append(event)
            if event.id in self._handlers:
                for handler in self._handlers[event.id]:
                    handler(event)
        return processed

    def clear(self):
        self._queue.clear()
        self._counter = 0
