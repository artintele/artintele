"""Test fixtures.

Each test runs against a throwaway SQLite file (via a dependency override) so
nothing touches the real database. Outbound email is captured in-memory instead
of being sent, so we can assert that sales@prachalas.com *would* be notified
without needing SMTP.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend import config
from backend import main as app_main
from backend.database import Base, get_db


def _authenticate(client):
    """Establish a dashboard session via the dev-login route (no Google needed).

    Exercises the real SessionMiddleware/cookie path, so the admin routes are
    tested through the same session gate production uses."""
    r = client.get("/auth/dev-login", follow_redirects=False)
    assert r.status_code in (302, 307)
    return client


@pytest.fixture()
def client(tmp_path, monkeypatch):
    # --- isolated database -------------------------------------------------
    db_file = tmp_path / "test.db"
    engine = create_engine(
        f"sqlite:///{db_file}", connect_args={"check_same_thread": False}, future=True
    )
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app_main.app.dependency_overrides[get_db] = override_get_db

    # --- capture outbound email -------------------------------------------
    sent = []

    def fake_send(lead):
        sent.append(lead)
        return True  # pretend SMTP delivered

    monkeypatch.setattr(app_main, "send_lead_notification", fake_send)

    # Allow the dev-login route so tests can establish a session.
    monkeypatch.setattr(config, "DASHBOARD_DEV_BYPASS", True)
    monkeypatch.setattr(config, "ALLOWED_EMAIL_DOMAIN", "prachalas.com")

    # NOT used as a context manager on purpose: that keeps the startup event
    # (which would create the *real* DB) from firing.
    c = TestClient(app_main.app)
    c.sent_emails = sent
    yield c

    app_main.app.dependency_overrides.clear()


@pytest.fixture()
def auth_client(client):
    """A client with an active dashboard session."""
    return _authenticate(client)


@pytest.fixture()
def demo_payload():
    return {
        "name": "Priya Sharma",
        "company": "Sunrise Clinic",
        "email": "priya@sunrise.example",
        "phone": "+91 98800 11223",
        "intent": "Schedule a demo",
        "message": "200 patient calls/day — want an AI receptionist.",
        "source": "contact-page",
    }


@pytest.fixture()
def consult_payload():
    return {
        "name": "Rahul Verma",
        "company": "VerMa Realty",
        "email": "rahul@verma.example",
        "intent": "Book a consultation",
        "message": "Lead follow-up automation.",
        "source": "contact-page",
    }
