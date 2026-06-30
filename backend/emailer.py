"""Email notifications.

On every booking/lead, sales@prachalas.com gets a notification. Demo bookings
get a distinct, high-priority subject so the sales team can spot them fast.

If SMTP isn't configured the message is logged instead of sent — the lead is
always stored regardless, so nothing is lost.
"""
import logging
import smtplib
import ssl
from email.message import EmailMessage

import certifi

from . import config

log = logging.getLogger("artintele.email")


def _build_lead_email(lead) -> EmailMessage:
    is_demo = "demo" in (lead.intent or "").lower()
    tag = "DEMO BOOKED" if is_demo else "NEW LEAD"
    subject = f"[{tag}] {lead.name}" + (f" — {lead.company}" if lead.company else "")

    lines = [
        f"A new {'demo booking' if is_demo else 'lead'} just came in on artintele.ai.",
        "",
        f"Name:        {lead.name}",
        f"Company:     {lead.company or '—'}",
        f"Website:     {getattr(lead, 'website', '') or '—'}",
        f"Email:       {lead.email}",
        f"Phone:       {lead.phone or '—'}",
        f"Intent:      {lead.intent or '—'}",
        f"Calls/month: {getattr(lead, 'call_volume', '') or '—'}",
        f"Services:    {getattr(lead, 'services', '') or '—'}",
        f"Lead source: {getattr(lead, 'lead_source', '') or '—'}",
        f"Page:        {lead.source}",
        "",
        "Message:",
        (lead.message or "—"),
        "",
        "—",
        "This lead has been saved to the CRM for follow-up calling.",
        "Work it from the telecaller dashboard: /dashboard",
    ]
    body = "\n".join(lines)

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = config.SMTP_FROM
    # Notify sales + marketing (and any extra configured recipients).
    msg["To"] = ", ".join(config.LEAD_NOTIFY_EMAILS)
    if lead.email:
        msg["Reply-To"] = lead.email
    msg.set_content(body)
    return msg


def send_lead_notification(lead) -> bool:
    """Send (or log) the sales notification. Never raises — email must never
    block storing a lead. Returns True if actually sent over SMTP."""
    msg = _build_lead_email(lead)

    if not config.EMAIL_CONFIGURED:
        log.warning(
            "SMTP not configured — email NOT sent. Would deliver to %s:\n%s",
            msg["To"],
            msg.get_content(),
        )
        return False

    try:
        # Use certifi's CA bundle so TLS verification works regardless of the
        # host's system certificate store.
        ctx = ssl.create_default_context(cafile=certifi.where())
        if config.SMTP_USE_TLS:
            with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=20) as server:
                server.starttls(context=ctx)
                server.login(config.SMTP_USER, config.SMTP_PASS)
                server.send_message(msg)
        else:
            with smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT, timeout=20, context=ctx) as server:
                server.login(config.SMTP_USER, config.SMTP_PASS)
                server.send_message(msg)
        log.info("Sent lead notification for #%s to %s", getattr(lead, "id", "?"), msg["To"])
        return True
    except Exception as exc:  # noqa: BLE001 — log and move on
        log.exception("Failed to send lead notification: %s", exc)
        return False
