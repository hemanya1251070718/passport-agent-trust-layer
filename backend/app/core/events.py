import asyncio
import json
import logging
from typing import AsyncGenerator, Set

logger = logging.getLogger("passport.events")

class EventBroadcaster:
    _instance = None

    def __init__(self):
        self._subscribers: Set[asyncio.Queue] = set()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = EventBroadcaster()
        return cls._instance

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue(maxsize=100)
        self._subscribers.add(q)
        logger.info("New SSE client subscribed. Total listeners: %d", len(self._subscribers))
        return q

    def unsubscribe(self, q: asyncio.Queue):
        if q in self._subscribers:
            self._subscribers.remove(q)
            logger.info("SSE client disconnected. Remaining listeners: %d", len(self._subscribers))

    async def broadcast(self, event_type: str, data: dict):
        message = {
            "type": event_type,
            "data": data
        }
        dead_queues = []
        for q in list(self._subscribers):
            try:
                q.put_nowait(message)
            except asyncio.QueueFull:
                dead_queues.append(q)
            except Exception:
                dead_queues.append(q)
        
        for dq in dead_queues:
            self.unsubscribe(dq)

    async def stream_events(self) -> AsyncGenerator[str, None]:
        q = self.subscribe()
        try:
            # Send initial connected ping
            yield f"event: ping\ndata: {json.dumps({'status': 'connected'})}\n\n"
            while True:
                msg = await q.get()
                yield f"event: {msg['type']}\ndata: {json.dumps(msg['data'])}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            self.unsubscribe(q)
