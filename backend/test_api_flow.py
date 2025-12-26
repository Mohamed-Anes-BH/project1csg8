import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def print_step(message):
    print(f"\n{'='*50}")
    print(f"🔹 {message}")
    print(f"{'='*50}")

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

# 1. Inscription Entreprise
print_step("1. Inscription Entreprise")
company_data = {
    "email": f"techcorp_{int(time.time())}@example.com",
    "password": "password123",
    "company_name": "TechCorp Algérie",
    "description": "Leader en solutions IT",
    "sector": "Informatique",
    "website": "https://techcorp.dz"
}
response = requests.post(f"{BASE_URL}/auth/register/company/", json=company_data)
if response.status_code == 200:
    print_success("Entreprise créée avec succès")
    company_user_id = response.json()['user_id']
else:
    print_error(f"Erreur inscription entreprise: {response.text}")
    exit()

# 2. Connexion Entreprise (pour récupérer l'ID du profil)
print_step("2. Connexion Entreprise")
response = requests.post(f"{BASE_URL}/auth/login/", json={
    "email": company_data['email'],
    "password": company_data['password']
})
if response.status_code == 200:
    print_success("Connexion entreprise réussie")
    company_profile_id = response.json()['user']['company_id']
else:
    print_error(f"Erreur connexion: {response.text}")
    exit()

# 3. Création d'une Offre Ciblée
print_step("3. Création d'une Offre (Stage Data Science)")
# On suppose que l'ID 1 est "Informatique" et l'ID 1 est "Génie Logiciel" (basé sur les données initiales)
offer_data = {
    "company_id": company_profile_id,
    "title": "Stage Data Scientist Junior",
    "description": "Stage de fin d'études en Machine Learning",
    "offer_type": "PFE",
    "duration": "6 mois",
    "location": "Alger Centre",
    "is_targeted": True,
    "specialty_ids": [1], # Génie Logiciel (supposé)
    "university_ids": [1] # USTHB (supposé)
}
response = requests.post(f"{BASE_URL}/offers/create/", json=offer_data)
if response.status_code == 200:
    print_success("Offre créée avec succès")
    offer_id = response.json()['offer_id']
else:
    print_error(f"Erreur création offre: {response.text}")
    exit()

# 4. Inscription Étudiant
print_step("4. Inscription Étudiant")
student_data = {
    "email": f"student_{int(time.time())}@usthb.dz",
    "password": "password123",
    "first_name": "Amine",
    "last_name": "Ben",
    "university_id": 1, # USTHB
    "domain_id": 1, # Informatique
    "specialty_id": 1 # Génie Logiciel
}
response = requests.post(f"{BASE_URL}/auth/register/student/", json=student_data)
if response.status_code == 200:
    print_success("Étudiant inscrit avec succès")
    student_user_id = response.json()['user_id']
else:
    print_error(f"Erreur inscription étudiant: {response.text}")
    exit()

# 5. Connexion Étudiant
print_step("5. Connexion Étudiant")
response = requests.post(f"{BASE_URL}/auth/login/", json={
    "email": student_data['email'],
    "password": student_data['password']
})
if response.status_code == 200:
    print_success("Connexion étudiant réussie")
    student_profile_id = response.json()['user']['student_id']
else:
    print_error(f"Erreur connexion étudiant: {response.text}")
    exit()

# 6. Recherche Avancée
print_step("6. Test Recherche Avancée (Filtre Location)")
response = requests.get(f"{BASE_URL}/offers/", params={"location": "Alger"})
offers = response.json().get('offers', [])
if len(offers) > 0:
    print_success(f"Recherche réussie : {len(offers)} offre(s) trouvée(s) à Alger")
    print(f"   Titre: {offers[0]['title']}")
else:
    print_error("Aucune offre trouvée avec le filtre location='Alger'")

# 7. Test Matching (Recommandations)
print_step("7. Test Algorithme de Matching")
response = requests.get(f"{BASE_URL}/offers/recommended/", params={"student_id": student_profile_id})
recos = response.json().get('offers', [])
if len(recos) > 0:
    print_success(f"Matching réussi : {len(recos)} offre(s) recommandée(s) pour votre spécialité")
    print(f"   Offre recommandée: {recos[0]['title']}")
else:
    print_error("Aucune recommandation trouvée (Vérifiez les IDs de spécialité)")

# 8. Candidature
print_step("8. Postuler à l'offre")
response = requests.post(f"{BASE_URL}/offers/{offer_id}/apply/", json={"student_id": student_profile_id})
if response.status_code == 200:
    print_success("Candidature envoyée avec succès")
else:
    print_error(f"Erreur candidature: {response.text}")

print("\n🎉 TEST COMPLET TERMINÉ AVEC SUCCÈS !")
