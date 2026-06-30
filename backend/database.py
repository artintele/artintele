"""SQLAlchemy engine / session setup."""
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from . import models  # noqa: F401 — ensure models are registered

    Base.metadata.create_all(bind=engine)
    _ensure_lead_columns()


# New Lead columns added over time -> additive migration for existing tables.
# (create_all never alters an existing table, so we add missing columns here.)
_LEAD_COLUMNS = {
    "website": "VARCHAR(300) DEFAULT ''",
    "call_volume": "VARCHAR(60) DEFAULT ''",
    "services": "TEXT DEFAULT ''",
    "lead_source": "VARCHAR(120) DEFAULT ''",
}


def _ensure_lead_columns():
    insp = inspect(engine)
    if "leads" not in insp.get_table_names():
        return
    existing = {c["name"] for c in insp.get_columns("leads")}
    with engine.begin() as conn:
        for col, ddl in _LEAD_COLUMNS.items():
            if col not in existing:
                conn.execute(text(f"ALTER TABLE leads ADD COLUMN {col} {ddl}"))
