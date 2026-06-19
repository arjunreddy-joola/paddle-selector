import os
from src.repositories.file_repository import read_json, write_json
from src.types.paddle_selector_types import PaddleSelectorSession, SessionsFile

_SESSIONS_FILE = os.getenv("SESSIONS_FILE", "src/data/sessions.json")
_SESSIONS_FILENAME = os.path.basename(_SESSIONS_FILE)


class SessionRepository:
    def get(self, session_id: str) -> PaddleSelectorSession | None:
        raw = read_json(_SESSIONS_FILENAME)
        parsed = SessionsFile.model_validate(raw)
        for s in parsed.sessions:
            if s.id == session_id:
                return s
        return None

    def save(self, session: PaddleSelectorSession) -> PaddleSelectorSession:
        raw = read_json(_SESSIONS_FILENAME)
        parsed = SessionsFile.model_validate(raw)
        sessions = [s for s in parsed.sessions if s.id != session.id]
        sessions.append(session)
        write_json(_SESSIONS_FILENAME, {"sessions": [s.model_dump(mode="json") for s in sessions]})
        return session
