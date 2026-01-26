import requests

BASE_URL = "http://localhost:8000"

# 1. Test health endpoint
def test_health():
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200
    print("Health endpoint OK")

# 2. Test admin login
def test_admin_login():
    data = {"username": "admin", "password": "admin123"}  # Change if needed
    r = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    assert r.status_code == 200
    token = r.json()["access_token"]
    print("Admin login OK")
    return token

# 3. Test writeup upload (requires admin token)
def test_writeup_upload(token):
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "title": "Test Writeup",
        "content": "This is a test writeup.",
        "tags": ["test", "demo"]
    }
    r = requests.post(f"{BASE_URL}/api/writeups/", json=data, headers=headers)
    assert r.status_code in (200, 201)
    print("Writeup upload OK")

# 4. Test comment submission
def test_comment():
    data = {
        "writeup_id": "",  # Fill with a valid writeup_id after upload
        "name": "Visitor",
        "content": "Nice writeup!"
    }
    # You may need to fetch a writeup_id first
    r = requests.get(f"{BASE_URL}/api/writeups/")
    writeups = r.json()
    if writeups:
        data["writeup_id"] = writeups[0]["id"]
        r = requests.post(f"{BASE_URL}/api/comments/", json=data)
        assert r.status_code in (200, 201)
        print("Comment submission OK")
    else:
        print("No writeups found to comment on.")

# 5. Test contact message
def test_contact():
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "message": "Hello from test script!"
    }
    r = requests.post(f"{BASE_URL}/api/contact/", json=data)
    assert r.status_code in (200, 201)
    print("Contact message OK")

if __name__ == "__main__":
    test_health()
    token = test_admin_login()
    test_writeup_upload(token)
    test_comment()
    test_contact()
