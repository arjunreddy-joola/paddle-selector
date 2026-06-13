import json
import os
from pathlib import Path
from filelock import FileLock
from typing import Any


DATA_DIR = Path(os.getenv("DATA_DIR", "src/data"))


def read_json(filename: str) -> dict[str, Any]:
    path = DATA_DIR / filename
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(filename: str, data: dict[str, Any]) -> None:
    path = DATA_DIR / filename
    lock_path = path.with_suffix(".lock")
    with FileLock(str(lock_path)):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
