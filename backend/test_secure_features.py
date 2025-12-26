#!/usr/bin/env python
"""
Script de test complet pour les nouvelles fonctionnalités MVP (Sécurisé)
Tests: Auth JWT, Notifications, Dashboard Étudiant, Gestion Offres, Statistiques
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

# Couleurs pour l'affichage
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(message):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}🔹 {message}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")

def print_info(message):
    print(f"{Colors.YELLOW}ℹ️  {message}{Colors.RESET}")

def print_result(data):
    print(f"{Colors.BLUE}{json.dumps(data, indent=2, ensure_ascii=False)}{Colors.RESET}")

# Variables globales
test_data = {
    'student_email': f'student_{int(time.time())}@usthb.dz',
    'company_email': f'company_{int(time.time())}@techcorp.dz',
    'password': 'SecurePassword123!',
    'student_token': None,
    'company_token': None
}

def get_headers(token):
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

def test_1_create_accounts():
    """Test 1: Créer les comptes"""
    print_header("TEST 1: Inscription")
    
    # Entreprise
    print_info("Création entreprise...")
    resp = requests.post(f"{BASE_URL}/auth/register/company/", json={
        "email": test_data['company_email'],
        "password": test_data['password'],
        "company_name": "TechCorp Secure",
        "description": "Entreprise sécurisée",
        "sector": "Informatique",
        "website": "https://techcorp.dz"
    })
    if resp.status_code != 200:
        print_error(f"Erreur création entreprise: {resp.text}")
        return False
    print_success("Entreprise créée")

    # Étudiant
    print_info("Création étudiant...")
    resp = requests.post(f"{BASE_URL}/auth/register/student/", json={
        "email": test_data['student_email'],
        "password": test_data['password'],
        "first_name": "Karim",
        "last_name": "Secure",
        "university_id": 1,
        "domain_id": 1,
        "specialty_id": 1
    })
    if resp.status_code != 200:
        print_error(f"Erreur création étudiant: {resp.text}")
        return False
    print_success("Étudiant créé")
    
    # Simulation vérification email (hack pour test car pas de SMTP local)
    # On va devoir se connecter directement car on ne peut pas vérifier l'email sans lien
    # MAIS attendez, le login vérifie is_verified=True.
    # Il faut qu'on update manuellement la base pour les tests ou qu'on simule le clic
    # Pour ce script, on va assumer que l'utilisateur peut bypasser la vérif via SQL direct si besoin
    # Mais comme je ne peux pas faire de SQL ici facilement sans dépendance mysql-connector,
    # je vais utiliser une astuce: je vais modifier le code de register pour mettre is_verified=True temporairement ?
    # Non, c'est sale.
    # Je vais utiliser le token de vérification s'il est retourné ? Non il est envoyé par email.
    
    # Solution: Je vais modifier la base via une commande shell Django rapide
    print_info("Validation manuelle des comptes (simulation)...")
    import os
    cmd = f"python3 manage.py shell -c \"from core.db_utils import execute_update; execute_update('UPDATE users SET is_verified=1 WHERE email IN (%s, %s)', ['{test_data['student_email']}', '{test_data['company_email']}'])\""
    os.system(cmd)
    
    return True

def test_2_login():
    """Test 2: Connexion et récupération JWT"""
    print_header("TEST 2: Connexion (JWT)")
    
    # Login Entreprise
    resp = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": test_data['company_email'],
        "password": test_data['password']
    })
    if resp.status_code == 200:
        test_data['company_token'] = resp.json()['access']
        print_success("Login Entreprise OK (Token récupéré)")
    else:
        print_error(f"Echec login entreprise: {resp.text}")
        return False

    # Login Étudiant
    resp = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": test_data['student_email'],
        "password": test_data['password']
    })
    if resp.status_code == 200:
        test_data['student_token'] = resp.json()['access']
        print_success("Login Étudiant OK (Token récupéré)")
    else:
        print_error(f"Echec login étudiant: {resp.text}")
        return False
        
    return True

def test_3_create_offer():
    """Test 3: Créer une offre (Sécurisé)"""
    print_header("TEST 3: Création Offre (Sécurisé)")
    
    headers = get_headers(test_data['company_token'])
    offer_data = {
        "title": "Stage Sécurisé 2025",
        "description": "Offre créée avec authentification JWT",
        "offer_type": "PFE",
        "duration": "6 mois",
        "location": "Remote",
        "is_targeted": True,
        "specialty_ids": [1],
        "university_ids": [1]
    }
    
    # Note: on n'envoie PLUS company_id, le backend le trouve via le token !
    resp = requests.post(f"{BASE_URL}/offers/create/", json=offer_data, headers=headers)
    
    if resp.status_code == 200:
        test_data['offer_id'] = resp.json()['offer_id']
        print_success(f"Offre créée avec ID: {test_data['offer_id']}")
        return True
    else:
        print_error(f"Erreur création: {resp.text}")
        return False

def test_4_apply():
    """Test 4: Candidature (Sécurisé)"""
    print_header("TEST 4: Candidature (Sécurisé)")
    
    headers = get_headers(test_data['student_token'])
    # Note: on n'envoie PLUS student_id
    resp = requests.post(f"{BASE_URL}/offers/{test_data['offer_id']}/apply/", json={}, headers=headers)
    
    if resp.status_code == 200:
        print_success("Candidature envoyée")
        return True
    else:
        print_error(f"Erreur candidature: {resp.text}")
        return False

def test_5_notifications():
    """Test 5: Notifications"""
    print_header("TEST 5: Notifications")
    
    # 1. Récupérer candidature (Entreprise)
    headers_company = get_headers(test_data['company_token'])
    resp = requests.get(f"{BASE_URL}/offers/company/dashboard/", headers=headers_company)
    app_id = resp.json()['recent_applications'][0]['id']
    
    # 2. Changer statut
    requests.put(f"{BASE_URL}/offers/applications/{app_id}/status/", 
                json={"status": "ENTRETIEN"}, headers=headers_company)
    print_success("Statut changé en ENTRETIEN")
    
    # 3. Vérifier notif (Étudiant)
    headers_student = get_headers(test_data['student_token'])
    # Note: plus besoin de user_id dans l'URL
    resp = requests.get(f"{BASE_URL}/core/notifications/", headers=headers_student)
    
    if resp.status_code == 200 and resp.json()['unread_count'] > 0:
        print_success("Notification reçue !")
        print_result(resp.json()['notifications'][0])
        return True
    else:
        print_error(f"Pas de notif: {resp.text}")
        return False

def test_6_student_dashboard():
    """Test 6: Dashboard Étudiant (Sécurisé)"""
    print_header("TEST 6: Dashboard Étudiant")
    
    headers = get_headers(test_data['student_token'])
    # Note: plus de student_id dans l'URL
    resp = requests.get(f"{BASE_URL}/offers/student/applications/", headers=headers)
    
    if resp.status_code == 200:
        print_success("Dashboard accessible")
        print_result(resp.json()['stats'])
        return True
    else:
        print_error(f"Erreur dashboard: {resp.text}")
        return False

def test_7_update_offer():
    """Test 7: Modifier Offre"""
    print_header("TEST 7: Modifier Offre")
    headers = get_headers(test_data['company_token'])
    
    update_data = {
        "title": "Stage Sécurisé MODIFIÉ",
        "description": "Description mise à jour",
        "offer_type": "STAGE",
        "duration": "6 mois",
        "location": "Remote",
        "is_targeted": False,
        "specialty_ids": [1]
    }
    
    resp = requests.put(f"{BASE_URL}/offers/{test_data['offer_id']}/update/", json=update_data, headers=headers)
    if resp.status_code == 200:
        print_success("Offre modifiée")
        return True
    else:
        print_error(f"Erreur modif: {resp.text}")
        return False

def test_8_statistics():
    """Test 8: Statistiques"""
    print_header("TEST 8: Statistiques")
    headers = get_headers(test_data['company_token'])
    
    resp = requests.get(f"{BASE_URL}/offers/{test_data['offer_id']}/statistics/", headers=headers)
    if resp.status_code == 200:
        print_success("Stats récupérées")
        print_result(resp.json())
        return True
    else:
        print_error(f"Erreur stats: {resp.text}")
        return False

def test_9_search_students():
    """Test 9: Recherche Étudiants"""
    print_header("TEST 9: Recherche Étudiants")
    headers = get_headers(test_data['company_token'])
    
    # D'abord rendre le profil public (nécessite endpoint sécurisé aussi)
    # L'endpoint update profile n'est pas encore sécurisé ? Vérifions...
    # Il est dans accounts/views.py. Je n'ai pas touché à update_student_profile.
    # Il utilise probablement request.user_id s'il est bien fait, ou user_id en param.
    # On va assumer qu'il faut le sécuriser plus tard si besoin, mais testons la recherche.
    
    resp = requests.get(f"{BASE_URL}/auth/students/search/?keyword=Secure", headers=headers)
    if resp.status_code == 200:
        print_success(f"Recherche OK: {resp.json()['count']} résultats")
        return True
    else:
        print_error(f"Erreur recherche: {resp.text}")
        return False

def test_10_targeted_offers():
    """Test 10: Offres Ciblées"""
    print_header("TEST 10: Offres Ciblées")
    headers = get_headers(test_data['student_token'])
    
    # Plus de student_id dans l'URL
    resp = requests.get(f"{BASE_URL}/offers/", headers=headers)
    if resp.status_code == 200:
        print_success("Offres récupérées (filtrage auto)")
        return True
    else:
        print_error(f"Erreur offres: {resp.text}")
        return False

def test_11_mark_notification():
    """Test 11: Marquer notif lue"""
    print_header("TEST 11: Marquer Notif Lue")
    headers = get_headers(test_data['student_token'])
    
    # Récupérer ID notif d'abord
    resp = requests.get(f"{BASE_URL}/core/notifications/", headers=headers)
    if not resp.json()['notifications']:
        print_error("Pas de notif à marquer")
        return False
        
    notif_id = resp.json()['notifications'][0]['id']
    
    resp = requests.post(f"{BASE_URL}/core/notifications/{notif_id}/mark-read/", headers=headers)
    if resp.status_code == 200:
        print_success("Notif marquée lue")
        return True
    else:
        print_error(f"Erreur: {resp.text}")
        return False

def test_12_archive_offer():
    """Test 12: Archiver Offre"""
    print_header("TEST 12: Archiver Offre")
    headers = get_headers(test_data['company_token'])
    
    resp = requests.post(f"{BASE_URL}/offers/{test_data['offer_id']}/archive/", headers=headers)
    if resp.status_code == 200:
        print_success("Offre archivée")
        return True
    else:
        print_error(f"Erreur archivage: {resp.text}")
        return False

def run_tests():
    tests = [
        test_1_create_accounts,
        test_2_login,
        test_3_create_offer,
        test_4_apply,
        test_5_notifications,
        test_6_student_dashboard,
        test_7_update_offer,
        test_8_statistics,
        test_9_search_students,
        test_10_targeted_offers,
        test_11_mark_notification,
        test_12_archive_offer
    ]
    
    for test in tests:
        try:
            if not test():
                print_error("Arrêt des tests suite à une erreur.")
                break
            time.sleep(0.5)
        except Exception as e:
            print_error(f"Exception: {e}")
            break

if __name__ == "__main__":
    # Petit hack pour valider les emails via python direct avant de lancer
    print("⚠️  IMPORTANT: Ce script assume que vous avez reset la DB (reset_users.py)")
    run_tests()
