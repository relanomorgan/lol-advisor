from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    env: str = "development"
    secret_key: str = "changeme"
    riot_api_key: str = ""
    database_url: str = ""
    redis_url: str = "redis://localhost:6379"
    anthropic_api_key: str = ""

model_config = {
        "env_file": "../.env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore"
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()