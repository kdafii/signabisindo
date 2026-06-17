from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Database ──
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "bisindo"
    db_password: str = "bisindo123"
    db_name: str = "bisindo_db"

    # ── JWT ──
    jwt_secret_key: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 600

    # ── Model ──
    model_path: str = "./bisindo_conv1d.h5"
    label_map_path: str = "./label_map.json"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", protected_namespaces=())

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()