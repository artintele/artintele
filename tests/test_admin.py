"""Telecaller CRM API — auth, pipeline updates, stats, and DataFrame export."""
import io

import openpyxl

from tests.conftest import ADMIN_AUTH


def _seed(client, demo_payload, consult_payload):
    client.post("/api/leads", json=demo_payload)
    client.post("/api/leads", json=consult_payload)


def test_admin_requires_auth(client):
    assert client.get("/api/admin/leads").status_code == 401
    assert client.get("/api/admin/stats").status_code == 401
    assert client.get("/api/admin/leads/export.csv").status_code == 401


def test_admin_rejects_bad_credentials(client):
    r = client.get("/api/admin/leads", auth=("admin", "wrong"))
    assert r.status_code == 401


def test_dashboard_page_needs_auth(client):
    assert client.get("/dashboard").status_code == 401
    assert client.get("/dashboard", auth=ADMIN_AUTH).status_code == 200


def test_stats_count_by_status(client, demo_payload, consult_payload):
    _seed(client, demo_payload, consult_payload)
    r = client.get("/api/admin/stats", auth=ADMIN_AUTH)
    assert r.status_code == 200
    stats = r.json()
    assert stats["total"] == 2
    assert stats["demos"] == 1
    assert stats["by_status"]["demo_booked"] == 1
    assert stats["by_status"]["new"] == 1


def test_telecaller_can_work_a_lead(client, consult_payload):
    lead_id = client.post("/api/leads", json=consult_payload).json()["id"]
    r = client.patch(
        f"/api/admin/leads/{lead_id}",
        json={"status": "contacted", "assigned_to": "Anita", "call_notes": "Call back Fri"},
        auth=ADMIN_AUTH,
    )
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "contacted"
    assert body["assigned_to"] == "Anita"
    assert body["call_notes"] == "Call back Fri"


def test_patch_rejects_unknown_status(client, consult_payload):
    lead_id = client.post("/api/leads", json=consult_payload).json()["id"]
    r = client.patch(f"/api/admin/leads/{lead_id}", json={"status": "bogus"}, auth=ADMIN_AUTH)
    assert r.status_code == 422


def test_patch_missing_lead_is_404(client):
    r = client.patch("/api/admin/leads/9999", json={"status": "won"}, auth=ADMIN_AUTH)
    assert r.status_code == 404


def test_status_filter_and_search(client, demo_payload, consult_payload):
    _seed(client, demo_payload, consult_payload)
    only_demo = client.get("/api/admin/leads?status_filter=demo_booked", auth=ADMIN_AUTH).json()
    assert only_demo["count"] == 1
    assert only_demo["leads"][0]["intent"] == "Schedule a demo"

    found = client.get("/api/admin/leads?q=verma", auth=ADMIN_AUTH).json()
    assert found["count"] == 1
    assert found["leads"][0]["company"] == "VerMa Realty"


def test_csv_export_is_a_dataframe(client, demo_payload, consult_payload):
    _seed(client, demo_payload, consult_payload)
    r = client.get("/api/admin/leads/export.csv", auth=ADMIN_AUTH)
    assert r.status_code == 200
    assert "text/csv" in r.headers["content-type"]
    text = r.text
    assert "name,company,email" in text.splitlines()[0]
    assert "priya@sunrise.example" in text
    assert "rahul@verma.example" in text


def test_xlsx_export_opens_as_workbook(client, demo_payload):
    client.post("/api/leads", json=demo_payload)
    r = client.get("/api/admin/leads/export.xlsx", auth=ADMIN_AUTH)
    assert r.status_code == 200
    assert "spreadsheetml" in r.headers["content-type"]
    wb = openpyxl.load_workbook(io.BytesIO(r.content))
    ws = wb.active
    header = [c.value for c in next(ws.iter_rows(max_row=1))]
    assert "email" in header
    # header row + 1 data row
    assert ws.max_row == 2
