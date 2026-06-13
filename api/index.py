import sys
import os

# Resolve backend source root so imports work in Vercel's serverless environment
_BACKEND = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
sys.path.insert(0, _BACKEND)

# Set DATA_DIR to absolute path — the default "src/data" is relative to CWD
# which is unpredictable in serverless; pin it to the deployed backend directory.
os.environ.setdefault("DATA_DIR", os.path.join(_BACKEND, "src", "data"))

from src.app import create_app  # noqa: E402
from mangum import Mangum  # noqa: E402

app = create_app()
handler = Mangum(app, lifespan="auto")
