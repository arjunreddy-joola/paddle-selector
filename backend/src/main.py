import uvicorn
from src.app import create_app
from src.config import settings

app = create_app()

if __name__ == "__main__":
    uvicorn.run("src.main:app", host=settings.host, port=settings.port, reload=True)
