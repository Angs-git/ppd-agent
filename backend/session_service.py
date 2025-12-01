# backend/session_service.py
import json
from pathlib import Path
from datetime import datetime, timedelta
import threading
import re

_LOCK = threading.Lock()

def redact_pii(text: str) -> str:
    # VERY SIMPLE redaction examples: emails, phone numbers, credit-card-like numbers.
    if text is None:
        return text
    s = text
    s = re.sub(r'\b[\w\.-]+@[\w\.-]+\.\w+\b', '[REDACTED_EMAIL]', s)
    s = re.sub(r'\b(?:\+?\d{1,3}[-.\s]?)?(?:\d{3}[-.\s]?){2}\d{4}\b', '[REDACTED_PHONE]', s)
    s = re.sub(r'\b\d{12,19}\b', '[REDACTED_NUMBER]', s)  # long numeric strings
    return s

class InMemorySessionService:
    """
    Simple in-memory session store for short-term conversation history.
    Each session holds a list of turns: {"role": "user"/"assistant", "content": "...", "time": ISO}
    Configurable retention: keep last `keep_recent` turns and optionally compact older turns.
    """
    def __init__(self, keep_recent: int = 8, persist_path: str = None):
        self.sessions = {}  # user_id -> list of turns
        self.keep_recent = keep_recent
        self.persist_path = Path(persist_path) if persist_path else None
        if self.persist_path:
            self._load_from_disk()

    def _load_from_disk(self):
        try:
            if self.persist_path.exists():
                data = json.loads(self.persist_path.read_text())
                self.sessions = data
        except Exception:
            self.sessions = {}

    def _persist_to_disk(self):
        if not self.persist_path:
            return
        try:
            with _LOCK:
                self.persist_path.write_text(json.dumps(self.sessions, indent=2))
        except Exception as e:
            print("Session persist failed:", e)

    def _now(self):
        return datetime.utcnow().isoformat()

    def append_turn(self, user_id: str, role: str, content: str):
        content = redact_pii(content)
        turn = {"role": role, "content": content, "time": self._now()}
        with _LOCK:
            if user_id not in self.sessions:
                self.sessions[user_id] = []
            self.sessions[user_id].append(turn)
            # retention: keep only last keep_recent turns for immediate history
            if len(self.sessions[user_id]) > self.keep_recent * 4:
                # compact older history to limit memory: keep last keep_recent for direct context
                self.sessions[user_id] = self.sessions[user_id][-self.keep_recent:]
        self._persist_to_disk()

    def get_recent(self, user_id: str, n: int = None):
        with _LOCK:
            arr = self.sessions.get(user_id, [])
            if n is None:
                n = self.keep_recent
            return arr[-n:]

    def get_all(self, user_id: str):
        with _LOCK:
            return list(self.sessions.get(user_id, []))

    def clear(self, user_id: str):
        with _LOCK:
            self.sessions.pop(user_id, None)
        self._persist_to_disk()

class MemoryBank:
    """
    Very small on-disk long-term memory store (keyed by user_id).
    Each entry is a list of memory items: {"time":"ISO","summary":"...","tags":[...]}
    Use this to keep long-term facts (e.g., 'prefers coffee', 'baby age 3 months').
    """
    def __init__(self, path: str = "memory_bank.json"):
        self.path = Path(path)
        self.data = {}
        self._load()

    def _load(self):
        try:
            if self.path.exists():
                self.data = json.loads(self.path.read_text())
        except Exception:
            self.data = {}

    def _save(self):
        try:
            self.path.write_text(json.dumps(self.data, indent=2))
        except Exception as e:
            print("MemoryBank save failed:", e)

    def add_memory(self, user_id: str, summary: str, tags=None):
        item = {"time": datetime.utcnow().isoformat(), "summary": redact_pii(summary), "tags": tags or []}
        if user_id not in self.data:
            self.data[user_id] = []
        self.data[user_id].append(item)
        self._save()

    def get_memories(self, user_id: str, limit: int = 10):
        return list(self.data.get(user_id, []))[-limit:]

    def forget(self, user_id: str):
        self.data.pop(user_id, None)
        self._save()


# Module-level singletons for use across the application
# Create a default session store and memory bank so other modules can import them
SESSION_STORE = InMemorySessionService(keep_recent=8, persist_path="sessions.json")
MEMORY_BANK = MemoryBank(path="memory_bank.json")
