from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    port: int = Field(default=4000, alias="PORT")
    host: str = Field(default="0.0.0.0", alias="HOST")
    node_env: str = Field(default="development", alias="NODE_ENV")
    strict_recommendation_validation: bool = Field(
        default=False, alias="STRICT_RECOMMENDATION_VALIDATION"
    )
    data_dir: str = Field(default="src/data", alias="DATA_DIR")
    sessions_file: str = Field(default="src/data/sessions.json", alias="SESSIONS_FILE")
    shopify_store_url: str = Field(default="", alias="SHOPIFY_STORE_URL")

    model_config = {"env_file": ".env", "populate_by_name": True, "extra": "ignore"}


settings = Settings()
