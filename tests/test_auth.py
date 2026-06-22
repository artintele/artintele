"""Dashboard auth: the @prachalas.com domain restriction is the security core."""
import pytest

from backend import auth, config


@pytest.fixture(autouse=True)
def _domain(monkeypatch):
    monkeypatch.setattr(config, "ALLOWED_EMAIL_DOMAIN", "prachalas.com")


@pytest.mark.parametrize("email", [
    "founder@prachalas.com",
    "Sales.Lead@Prachalas.com",   # case-insensitive
    "  ops@prachalas.com  ",        # surrounding whitespace
])
def test_allowed_domain_emails_pass(email):
    assert auth.email_allowed(email) is True


@pytest.mark.parametrize("email", [
    "someone@gmail.com",
    "attacker@prachalas.com.evil.com",   # suffix-spoof attempt
    "user@prachalas.ai",                  # wrong TLD
    "user@sub.prachalas.com.attacker.io",
    "prachalas.com@gmail.com",
    "",
    None,
])
def test_disallowed_emails_blocked(email):
    assert auth.email_allowed(email) is False


def test_dev_login_blocked_when_bypass_off(client, monkeypatch):
    monkeypatch.setattr(config, "DASHBOARD_DEV_BYPASS", False)
    r = client.get("/auth/dev-login", follow_redirects=False)
    assert r.status_code == 404


def test_login_route_unconfigured_returns_503(client, monkeypatch):
    # With no Google client configured, /auth/login must not silently "work".
    monkeypatch.setattr(config, "OAUTH_CONFIGURED", False)
    r = client.get("/auth/login", follow_redirects=False)
    assert r.status_code == 503
