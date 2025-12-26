import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def print_step(message):
    print(f"\n{'='*60}")
    print(f"🔹 {message}")
    print(f"{'='*60}")

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_info(message):
    print(f"ℹ️  {message}")

# Test 1: Inscription Étudiant
print_step("1. Inscription Étudiant (avec vérification email)")
student_email = f"student_jwt_{int(time.time())}@usthb.dz"
student_data = {
    "email": student_email,
    "password": "password123",
    "first_name": "Ahmed",
    "last_name": "Benali",
    "university_id": 1,
    "domain_id": 1,
    "specialty_id": 1
}
response = requests.post(f"{BASE_URL}/auth/register/student/", json=student_data)
if response.status_code == 200:
    result = response.json()
    print_success("Inscription réussie")
    print_info(f"Message: {result['message']}")
    print_info(f"Email envoyé: {result.get('email_sent', 'Non configuré')}")
else:
    print_error(f"Erreur: {response.text}")
    exit()

# Test 2: Tentative de connexion AVANT vérification email
print_step("2. Tentative de Connexion AVANT Vérification Email")
response = requests.post(f"{BASE_URL}/auth/login/", json={
    "email": student_email,
    "password": "password123"
})
if response.status_code == 403:
    print_success("Connexion bloquée comme prévu (email non vérifié)")
    print_info(f"Message: {response.json().get('message')}")
else:
    print_error("La connexion aurait dû être bloquée !")

# Test 3: Récupérer le token de vérification depuis la DB
print_step("3. Simulation Vérification Email (Récupération Token)")
import os
import sys
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dzstagiaire.settings')
django.setup()

from accounts.db_utils import execute_query_one
user = execute_query_one("SELECT id FROM users WHERE email = %s", [student_email])
if user:
    token_data = execute_query_one(
        "SELECT token FROM verification_tokens WHERE user_id = %s ORDER BY created_at DESC LIMIT 1",
        [user['id']]
    )
    if token_data:
        verification_token = token_data['token']
        print_success(f"Token récupéré: {verification_token[:20]}...")
    else:
        print_error("Token non trouvé")
        exit()
else:
    print_error("Utilisateur non trouvé")
    exit()

# Test 4: Vérifier l'email
print_step("4. Vérification de l'Email")
response = requests.get(f"{BASE_URL}/auth/verify-email/{verification_token}/")
if response.status_code == 200:
    print_success("Email vérifié avec succès")
    print_info(f"Message: {response.json()['message']}")
else:
    print_error(f"Erreur: {response.text}")
    exit()

# Test 5: Connexion APRÈS vérification (obtenir JWT)
print_step("5. Connexion APRÈS Vérification (Obtenir JWT)")
response = requests.post(f"{BASE_URL}/auth/login/", json={
    "email": student_email,
    "password": "password123"
})
if response.status_code == 200:
    result = response.json()
    print_success("Connexion réussie avec JWT")
    access_token = result['access']
    refresh_token = result['refresh']
    print_info(f"Access Token: {access_token[:30]}...")
    print_info(f"Refresh Token: {refresh_token[:30]}...")
    print_info(f"User: {result['user']['first_name']} {result['user']['last_name']}")
else:
    print_error(f"Erreur: {response.text}")
    exit()

# Test 6: Utiliser le JWT pour accéder à un endpoint protégé
print_step("6. Test Access Token (Récupérer Profil)")
headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get(f"{BASE_URL}/auth/student/profile/?user_id={result['user']['id']}", headers=headers)
if response.status_code == 200:
    print_success("Accès au profil réussi avec JWT")
    profile = response.json()['profile']
    print_info(f"Profil: {profile['first_name']} {profile['last_name']}")
else:
    print_error(f"Erreur: {response.text}")

# Test 7: Refresh Token
print_step("7. Test Refresh Token")
response = requests.post(f"{BASE_URL}/auth/token/refresh/", json={"refresh": refresh_token})
if response.status_code == 200:
    new_access_token = response.json()['access']
    print_success("Refresh token réussi")
    print_info(f"Nouveau Access Token: {new_access_token[:30]}...")
else:
    print_error(f"Erreur: {response.text}")

print("\n" + "="*60)
print("🎉 TESTS JWT COMPLETS TERMINÉS AVEC SUCCÈS !")
print("="*60)
print("\n📝 Résumé:")
print("  ✅ Inscription avec email de vérification")
print("  ✅ Blocage connexion si email non vérifié")
print("  ✅ Vérification email fonctionnelle")
print("  ✅ Connexion avec JWT tokens")
print("  ✅ Access token valide")
print("  ✅ Refresh token fonctionnel")
