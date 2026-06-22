"""Public lead-capture API — the demo-booking flow."""


def test_health_ok(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_demo_booking_is_stored_and_tagged(client, demo_payload):
    r = client.post("/api/leads", json=demo_payload)
    assert r.status_code == 201
    body = r.json()
    assert body["id"] >= 1
    assert body["name"] == "Priya Sharma"
    # demo intent is auto-tagged so the telecaller sees it immediately
    assert body["status"] == "demo_booked"


def test_demo_booking_emails_sales(client, demo_payload):
    client.post("/api/leads", json=demo_payload)
    # sales@prachalas.com would be notified (captured, not actually sent)
    assert len(client.sent_emails) == 1
    lead = client.sent_emails[0]
    assert lead.email == "priya@sunrise.example"
    assert lead.is_demo is True


def test_consultation_lead_defaults_to_new(client, consult_payload):
    r = client.post("/api/leads", json=consult_payload)
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "new"
    assert client.sent_emails[0].is_demo is False


def test_invalid_email_is_rejected(client):
    r = client.post("/api/leads", json={"name": "X", "email": "not-an-email", "intent": "demo"})
    assert r.status_code == 422


def test_missing_name_is_rejected(client):
    r = client.post("/api/leads", json={"email": "a@b.com", "intent": "demo"})
    assert r.status_code == 422


def test_lead_persists_and_is_retrievable_by_admin(auth_client, demo_payload):
    auth_client.post("/api/leads", json=demo_payload)
    r = auth_client.get("/api/admin/leads")
    assert r.status_code == 200
    data = r.json()
    assert data["count"] == 1
    assert data["leads"][0]["email"] == "priya@sunrise.example"
