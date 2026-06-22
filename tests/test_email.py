"""Email notification building + the no-SMTP fallback.

These test backend.emailer directly (no HTTP), so the real send path is covered
without the conftest email capture.
"""
from types import SimpleNamespace

from backend import config, emailer


def _lead(**kw):
    base = dict(
        id=1, name="Priya Sharma", company="Sunrise Clinic", email="priya@sunrise.example",
        phone="+91 98800 11223", intent="Schedule a demo", source="contact-page",
        message="Need an AI receptionist.",
    )
    base.update(kw)
    return SimpleNamespace(**base)


def test_demo_email_goes_to_sales_with_demo_subject():
    msg = emailer._build_lead_email(_lead())
    assert msg["To"] == config.SALES_EMAIL == "sales@prachalas.com"
    assert "DEMO BOOKED" in msg["Subject"]
    assert msg["Reply-To"] == "priya@sunrise.example"
    body = msg.get_content()
    assert "Sunrise Clinic" in body
    assert "priya@sunrise.example" in body


def test_non_demo_email_uses_lead_subject():
    msg = emailer._build_lead_email(_lead(intent="Book a consultation"))
    assert "NEW LEAD" in msg["Subject"]
    assert "DEMO BOOKED" not in msg["Subject"]


def test_send_returns_false_when_smtp_unconfigured(monkeypatch):
    # Default state: no SMTP host/user/pass -> logged, not sent.
    monkeypatch.setattr(config, "EMAIL_CONFIGURED", False)
    assert emailer.send_lead_notification(_lead()) is False


def test_send_never_raises_on_smtp_error(monkeypatch):
    monkeypatch.setattr(config, "EMAIL_CONFIGURED", True)
    monkeypatch.setattr(config, "SMTP_USE_TLS", True)

    def boom(*a, **k):
        raise OSError("connection refused")

    monkeypatch.setattr(emailer.smtplib, "SMTP", boom)
    # Must swallow the error so a bad mail server never blocks storing a lead.
    assert emailer.send_lead_notification(_lead()) is False
