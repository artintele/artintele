"""Careers talent-network submissions (multipart, optional resume)."""
import io


def test_talent_submission_without_resume(client):
    r = client.post(
        "/api/talent",
        data={"name": "Sam Dev", "email": "sam@dev.example", "interest": "AI / ML Engineering"},
    )
    assert r.status_code == 201
    assert r.json()["ok"] is True


def test_talent_submission_with_resume_upload(client):
    files = {"resume": ("cv.pdf", io.BytesIO(b"%PDF-1.4 fake"), "application/pdf")}
    r = client.post(
        "/api/talent",
        data={"name": "Dana Lee", "email": "dana@lee.example", "interest": "Product & Design"},
        files=files,
    )
    assert r.status_code == 201
    assert r.json()["ok"] is True


def test_talent_missing_required_field(client):
    r = client.post("/api/talent", data={"email": "x@y.com"})  # no name
    assert r.status_code == 422
