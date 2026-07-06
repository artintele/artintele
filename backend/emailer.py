"""Email notifications.

On every booking/lead, marketing@artintele.ai gets a notification laid out as a
clean table (HTML, with a plain-text fallback). Demo bookings get a distinct,
high-priority subject so the team can spot them fast.

If SMTP isn't configured the message is logged instead of sent — the lead is
always stored regardless, so nothing is lost.
"""
import html
import logging
import smtplib
import ssl
from email.message import EmailMessage

import certifi

from . import config

log = logging.getLogger("artintele.email")


def _lead_fields(lead):
    """Ordered (label, value) rows shown in the notification, most useful first."""
    return [
        ("Name", lead.name),
        ("Company", lead.company or "—"),
        ("Email", lead.email or "—"),
        ("Phone", lead.phone or "—"),
        ("Website", getattr(lead, "website", "") or "—"),
        ("Calls / month", getattr(lead, "call_volume", "") or "—"),
        ("Services wanted", getattr(lead, "services", "") or "—"),
        ("How they found us", getattr(lead, "lead_source", "") or "—"),
        ("Intent", lead.intent or "—"),
        ("Submitted from", lead.source or "—"),
    ]


def _services_list(lead):
    raw = getattr(lead, "services", "") or ""
    return [s.strip() for s in raw.split(",") if s.strip()]


def _build_text(lead, is_demo) -> str:
    lines = [
        f"A new {'demo booking' if is_demo else 'lead'} just came in on artintele.ai.",
        "",
    ]
    for label, value in _lead_fields(lead):
        lines.append(f"{label + ':':<20}{value}")
    lines += [
        "",
        "Message:",
        (lead.message or "—"),
        "",
        "—",
        "This lead has been saved to the CRM for follow-up calling.",
        "Work it from the telecaller dashboard: /dashboard",
    ]
    return "\n".join(lines)


def _build_html(lead, is_demo) -> str:
    """A disciplined, self-contained HTML table. All styles are inline so it
    renders consistently in Gmail (which strips <style> blocks)."""
    e = html.escape
    accent = "#e11d48" if is_demo else "#2563eb"
    badge = "DEMO BOOKED" if is_demo else "NEW LEAD"
    title = e(lead.name or "New lead")
    if lead.company:
        title += f" <span style='color:#6b7280;font-weight:400'>· {e(lead.company)}</span>"

    rows = []
    for i, (label, value) in enumerate(_lead_fields(lead)):
        # Render the services field as chips when there are several.
        if label == "Services wanted":
            chips = _services_list(lead)
            if chips:
                value_html = " ".join(
                    f"<span style='display:inline-block;background:#eef2ff;color:#3730a3;"
                    f"border-radius:6px;padding:2px 8px;margin:0 4px 4px 0;font-size:13px'>{e(c)}</span>"
                    for c in chips
                )
            else:
                value_html = "—"
        elif label == "Website" and value not in ("", "—"):
            href = value if value.startswith(("http://", "https://")) else f"https://{value}"
            value_html = f"<a href='{e(href)}' style='color:{accent}'>{e(value)}</a>"
        elif label == "Email" and value != "—":
            value_html = f"<a href='mailto:{e(value)}' style='color:{accent}'>{e(value)}</a>"
        else:
            value_html = e(str(value))

        bg = "#ffffff" if i % 2 == 0 else "#f9fafb"
        rows.append(
            f"<tr style='background:{bg}'>"
            f"<td style='padding:10px 14px;color:#6b7280;font-size:13px;font-weight:600;"
            f"width:170px;vertical-align:top;border-bottom:1px solid #f1f1f4'>{e(label)}</td>"
            f"<td style='padding:10px 14px;color:#111827;font-size:14px;"
            f"vertical-align:top;border-bottom:1px solid #f1f1f4'>{value_html}</td>"
            f"</tr>"
        )

    message_html = e(lead.message or "—").replace("\n", "<br>")

    return f"""\
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0"
             style="max-width:640px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <tr>
          <td style="background:{accent};padding:20px 24px">
            <span style="display:inline-block;background:rgba(255,255,255,.22);color:#fff;
                         font-size:11px;font-weight:700;letter-spacing:.06em;padding:4px 10px;
                         border-radius:20px">{badge}</span>
            <div style="color:#fff;font-size:20px;font-weight:700;margin-top:10px">{title}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px 8px;color:#374151;font-size:14px">
            A new {'demo booking' if is_demo else 'lead'} just came in on
            <strong>artintele.ai</strong>.
          </td>
        </tr>
        <tr>
          <td style="padding:8px 24px 4px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="border:1px solid #f1f1f4;border-radius:8px;overflow:hidden">
              {''.join(rows)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px 4px">
            <div style="color:#6b7280;font-size:13px;font-weight:600;margin-bottom:6px">Message</div>
            <div style="background:#f9fafb;border:1px solid #f1f1f4;border-radius:8px;
                        padding:12px 14px;color:#111827;font-size:14px;line-height:1.5">{message_html}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px 24px">
            <a href="{e(config.SITE_URL)}/dashboard"
               style="display:inline-block;background:{accent};color:#fff;text-decoration:none;
                      font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px">
              Open in CRM dashboard →
            </a>
            <div style="color:#9ca3af;font-size:12px;margin-top:14px">
              This lead has been saved to the CRM for follow-up calling.
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _plain_body(msg: EmailMessage) -> str:
    """The text/plain part of a (possibly multipart) message, for logging.

    `msg.get_content()` raises on a multipart/alternative message, so reach for
    the plain part explicitly — used on the no-SMTP path where we log instead
    of send.
    """
    part = msg.get_body(preferencelist=("plain",))
    return part.get_content() if part is not None else ""


def _build_lead_email(lead) -> EmailMessage:
    is_demo = "demo" in (lead.intent or "").lower()
    tag = "DEMO BOOKED" if is_demo else "NEW LEAD"
    subject = f"[{tag}] {lead.name}" + (f" — {lead.company}" if lead.company else "")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = config.SMTP_FROM
    # Notify marketing (and any extra configured recipients).
    msg["To"] = ", ".join(config.LEAD_NOTIFY_EMAILS)
    if lead.email:
        msg["Reply-To"] = lead.email
    # Plain-text first (fallback), then the HTML alternative Gmail will prefer.
    msg.set_content(_build_text(lead, is_demo))
    msg.add_alternative(_build_html(lead, is_demo), subtype="html")
    return msg


def send_lead_notification(lead) -> bool:
    """Send (or log) the sales notification. Never raises — email must never
    block storing a lead. Returns True if actually sent over SMTP."""
    msg = _build_lead_email(lead)

    if not config.EMAIL_CONFIGURED:
        log.warning(
            "SMTP not configured — email NOT sent. Would deliver to %s:\n%s",
            msg["To"],
            _plain_body(msg),
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
