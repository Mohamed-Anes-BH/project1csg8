import requests
import time
import os

BASE_URL = "http://localhost:8000/api"
SWAGGER_URL = "http://localhost:8000/swagger/"

# Couleurs
GREEN = '\033[92m'
RED = '\033[91m'
RESET = '\033[0m'

def print_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def test_validation():
    print("\n🔹 TEST 1: Validation (Password Strength)")
    email = f"weak_{int(time.time())}@test.com"
    
    # Mot de passe faible
    resp = requests.post(f"{BASE_URL}/auth/register/student/", json={
        "email": email,
        "password": "weak",
        "first_name": "Weak",
        "last_name": "Pass",
        "university_id": 1,
        "domain_id": 1,
        "specialty_id": 1
    })
    
    if resp.status_code == 400 and "Password must be at least 8 characters" in resp.text:
        print_success("Weak password rejected")
    else:
        print_error(f"Weak password NOT rejected: {resp.text}")
        return False
        
    # Mot de passe fort
    strong_pass = "SecurePass123!"
    resp = requests.post(f"{BASE_URL}/auth/register/student/", json={
        "email": email,
        "password": strong_pass,
        "first_name": "Strong",
        "last_name": "Pass",
        "university_id": 1,
        "domain_id": 1,
        "specialty_id": 1
    })
    
    if resp.status_code == 200:
        print_success("Strong password accepted")
        return email, strong_pass
    else:
        print_error(f"Strong password failed: {resp.text}")
        return False

def get_token(email, password):
    # Valider le compte (Hack)
    cmd = f"python3 manage.py shell -c \"from core.db_utils import execute_update; execute_update('UPDATE users SET is_verified=1 WHERE email = %s', ['{email}'])\""
    os.system(cmd)
    
    resp = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": email,
        "password": password
    })
    return resp.json()['access']

def test_profile_security(token):
    print("\n🔹 TEST 2: Profile Security")
    headers = {'Authorization': f'Bearer {token}'}
    
    # GET Profile (sans user_id dans l'URL)
    resp = requests.get(f"{BASE_URL}/auth/student/profile/", headers=headers)
    if resp.status_code == 200:
        print_success("Profile access secure (via token)")
    else:
        print_error(f"Profile access failed: {resp.text}")
        return False
        
    # PUT Profile (sans user_id dans le body)
    update_data = {
        "first_name": "UpdatedName",
        "last_name": "UpdatedLast",
        "skills": "Python, Django",
        "experience": "Junior",
        "education": "Master",
        "portfolio_link": "http://portfolio.com",
        "github_link": "http://github.com",
        "cv_visibility": "PUBLIC"
    }
    resp = requests.put(f"{BASE_URL}/auth/student/profile/", json=update_data, headers=headers)
    if resp.status_code == 200:
        print_success("Profile update secure (via token)")
    else:
        print_error(f"Profile update failed: {resp.text}")
        return False
        
    return True

def test_pagination(token):
    print("\n🔹 TEST 3: Pagination")
    headers = {'Authorization': f'Bearer {token}'}
    
    # On a besoin d'un compte entreprise pour créer des offres
    # Pour simplifier, on teste juste que l'endpoint répond avec la structure de pagination
    # même s'il n'y a pas beaucoup d'offres.
    
    resp = requests.get(f"{BASE_URL}/offers/?page=1&limit=5", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        if 'pagination' in data and 'offers' in data:
            print_success(f"Pagination metadata present: {data['pagination']}")
        else:
            print_error("Pagination metadata missing")
            return False
    else:
        print_error(f"Offers list failed: {resp.text}")
        return False
        
    return True

def test_swagger():
    print("\n🔹 TEST 4: Swagger Documentation")
    resp = requests.get(SWAGGER_URL)
    if resp.status_code == 200:
        print_success("Swagger UI accessible")
    else:
        print_error(f"Swagger UI failed: {resp.status_code}")
        return False
    return True

if __name__ == "__main__":
    creds = test_validation()
    if creds:
        email, password = creds
        token = get_token(email, password)
        if token:
            test_profile_security(token)
            test_pagination(token)
            test_swagger()
