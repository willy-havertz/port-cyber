import pytest
import requests

BASE_URL = "http://localhost:8000"

def test_health():
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200

def test_admin_login():
    data = {"username": "admin", "password": "admin123"}  # Change if needed
    r = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    assert r.status_code == 200
    assert "access_token" in r.json()
    return r.json()["access_token"]

def test_writeup_upload():
    token = test_admin_login()
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "title": "Test Writeup",
        "content": "This is a test writeup.",
        "tags": ["test", "demo"]
    }
    r = requests.post(f"{BASE_URL}/api/writeups/", json=data, headers=headers)
    assert r.status_code in (200, 201)

def test_comment():
    r = requests.get(f"{BASE_URL}/api/writeups/")
    writeups = r.json()
    if writeups:
        data = {
            "writeup_id": writeups[0]["id"],
            "name": "Visitor",
            "content": "Nice writeup!"
        }
        r = requests.post(f"{BASE_URL}/api/comments/", json=data)
        assert r.status_code in (200, 201)
    else:
        pytest.skip("No writeups found to comment on.")

def test_contact():
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "message": "Hello from test script!"
    }
    r = requests.post(f"{BASE_URL}/api/contact/", json=data)
    assert r.status_code in (200, 201)
