import requests
import os
import time

BASE_URL = "http://localhost:8000/api"
UPLOAD_URL = f"{BASE_URL}/core/upload/"

# Couleurs
GREEN = '\033[92m'
RED = '\033[91m'
RESET = '\033[0m'

def get_token():
    # 1. Créer un user
    email = f"uploader_{int(time.time())}@test.com"
    password = "SecurePassword123!"
    
    requests.post(f"{BASE_URL}/auth/register/student/", json={
        "email": email,
        "password": password,
        "first_name": "Upload",
        "last_name": "Tester",
        "university_id": 1,
        "domain_id": 1,
        "specialty_id": 1
    })
    
    # 2. Valider (Hack via SQL direct comme dans test_secure_features)
    import os
    cmd = f"python3 manage.py shell -c \"from core.db_utils import execute_update; execute_update('UPDATE users SET is_verified=1 WHERE email = %s', ['{email}'])\""
    os.system(cmd)
    
    # 3. Login
    resp = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": email,
        "password": password
    })
    
    if resp.status_code == 200:
        return resp.json()['access']
    else:
        print(f"{RED}❌ Login Failed: {resp.text}{RESET}")
        return None

def create_dummy_files():
    # Créer un faux PDF
    with open("test.pdf", "wb") as f:
        f.write(b"%PDF-1.4 dummy content")
        
    # Créer une fausse image
    with open("test.png", "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n dummy content")
        
    # Créer un faux fichier exe
    with open("test.exe", "wb") as f:
        f.write(b"MZ dummy content")

def test_upload_cv(token):
    print("Testing CV Upload...")
    headers = {'Authorization': f'Bearer {token}'}
    with open("test.pdf", "rb") as f:
        files = {'file': f}
        data = {'type': 'cv'}
        response = requests.post(UPLOAD_URL, files=files, data=data, headers=headers)
        
    if response.status_code == 200:
        print(f"{GREEN}✅ CV Upload Success: {response.json()['url']}{RESET}")
        return True
    else:
        print(f"{RED}❌ CV Upload Failed: {response.text}{RESET}")
        return False

def test_upload_logo(token):
    print("Testing Logo Upload...")
    headers = {'Authorization': f'Bearer {token}'}
    with open("test.png", "rb") as f:
        files = {'file': f}
        data = {'type': 'logo'}
        response = requests.post(UPLOAD_URL, files=files, data=data, headers=headers)
        
    if response.status_code == 200:
        print(f"{GREEN}✅ Logo Upload Success: {response.json()['url']}{RESET}")
        return True
    else:
        print(f"{RED}❌ Logo Upload Failed: {response.text}{RESET}")
        return False

def test_invalid_type(token):
    print("Testing Invalid Type (EXE)...")
    headers = {'Authorization': f'Bearer {token}'}
    with open("test.exe", "rb") as f:
        files = {'file': f}
        data = {'type': 'cv'} 
        response = requests.post(UPLOAD_URL, files=files, data=data, headers=headers)
        
    if response.status_code == 400:
        print(f"{GREEN}✅ Invalid Type Blocked Correctly{RESET}")
        return True
    else:
        print(f"{RED}❌ Invalid Type NOT Blocked: {response.status_code}{RESET}")
        return False

def cleanup():
    if os.path.exists("test.pdf"): os.remove("test.pdf")
    if os.path.exists("test.png"): os.remove("test.png")
    if os.path.exists("test.exe"): os.remove("test.exe")

if __name__ == "__main__":
    create_dummy_files()
    try:
        token = get_token()
        if token:
            test_upload_cv(token)
            test_upload_logo(token)
            test_invalid_type(token)
    finally:
        cleanup()
