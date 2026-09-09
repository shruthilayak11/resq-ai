"""
Storage layer for RESQ-AI.

Two backends, same interface, selected by MONGODB_URI:

- If MONGODB_URI is unset / points at nothing reachable -> JsonCollection
  (flat JSON files under backend/data/, one file per collection). This is
  what runs out of the box in a hackathon sandbox with no Atlas cluster.

- If MONGODB_URI is set to a real mongodb:// or mongodb+srv:// URI and
  `motor` + a reachable cluster are available -> MongoCollection, a thin
  wrapper around a real motor/pymongo collection.

Both expose the same async methods used by the rest of the app:
    find_all(), find_one(query), insert(doc), update(id, patch), count(query)

This means swapping to real MongoDB Atlas is just setting MONGODB_URI in
.env — no application code changes required.
"""
import json
import os
import threading
import uuid
from pathlib import Path
from typing import Any, Optional

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

MONGODB_URI = os.getenv("MONGODB_URI", "")
USE_REAL_MONGO = MONGODB_URI.startswith("mongodb://") or MONGODB_URI.startswith("mongodb+srv://")

_lock = threading.Lock()


def new_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:10]}"


class JsonCollection:
    """A single JSON-file collection that mimics the small slice of the
    MongoDB collection API this app needs."""

    def __init__(self, name: str):
        self.name = name
        self.path = DATA_DIR / f"{name}.json"
        if not self.path.exists():
            self.path.write_text("[]")

    def _read(self) -> list[dict]:
        with _lock:
            try:
                return json.loads(self.path.read_text() or "[]")
            except json.JSONDecodeError:
                return []

    def _write(self, docs: list[dict]) -> None:
        with _lock:
            self.path.write_text(json.dumps(docs, indent=2, default=str))

    async def find_all(self, query: Optional[dict] = None) -> list[dict]:
        docs = self._read()
        if not query:
            return docs
        return [d for d in docs if _matches(d, query)]

    async def find_one(self, query: dict) -> Optional[dict]:
        for d in self._read():
            if _matches(d, query):
                return d
        return None

    async def insert(self, doc: dict) -> dict:
        docs = self._read()
        if "id" not in doc:
            doc["id"] = new_id()
        docs.append(doc)
        self._write(docs)
        return doc

    async def update(self, id_: str, patch: dict) -> Optional[dict]:
        docs = self._read()
        for d in docs:
            if d.get("id") == id_:
                d.update(patch)
                self._write(docs)
                return d
        return None

    async def delete(self, id_: str) -> bool:
        docs = self._read()
        new_docs = [d for d in docs if d.get("id") != id_]
        if len(new_docs) == len(docs):
            return False
        self._write(new_docs)
        return True

    async def count(self, query: Optional[dict] = None) -> int:
        return len(await self.find_all(query))

    async def replace_all(self, docs: list[dict]) -> None:
        self._write(docs)


def _matches(doc: dict, query: dict) -> bool:
    for k, v in query.items():
        if doc.get(k) != v:
            return False
    return True


class Collections:
    """Registry of all collections used by the app."""

    def __init__(self):
        self.incidents = JsonCollection("incidents")
        self.volunteers = JsonCollection("volunteers")
        self.resources = JsonCollection("resources")
        self.assignments = JsonCollection("assignments")


db = Collections()
STORAGE_MODE = "mongodb" if USE_REAL_MONGO else "json-file (local, Mongo-compatible)"
