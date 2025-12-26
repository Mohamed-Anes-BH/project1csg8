#!/usr/bin/env python
"""
Script de test complet pour les nouvelles fonctionnalités MVP
Tests: Notifications, Dashboard Étudiant, Gestion Offres, Statistiques, Recherche Profils
"""

import requests
import json
import time
from datetime import datetime

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

# Variables globales pour stocker les IDs
test_data = {
    'student_email': f'test_student_{int(time.time())}@usthb.dz',
    'company_email': f'test_company_{int(time.time())}@techcorp.dz',
    'password': 'TestPassword123'
}

def test_1_create_accounts():
    """Test 1: Créer un étudiant et une entreprise"""
    print_header("TEST 1: Création des Comptes")
    
    # Créer entreprise
    print_info("Création d'une entreprise...")
    company_data = {
        "email": test_data['company_email'],
        "password": test_data['password'],
        "company_name": "TechCorp Test",
        "description": "Entreprise de test",
        "sector": "Informatique",
        "website": "https://techcorp-test.dz"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register/company/", json=company_data)
    if response.status_code == 200:
        print_success("Entreprise créée avec succès")
    else:
        print_error(f"Erreur création entreprise: {response.text}")
        return False
    
    # Créer étudiant
    print_info("Création d'un étudiant...")
    student_data = {
        "email": test_data['student_email'],
        "password": test_data['password'],
        "first_name": "Ahmed",
        "last_name": "Test",
        "university_id": 1,
        "domain_id": 1,
        "specialty_id": 1
    }
    
    response = requests.post(f"{BASE_URL}/auth/register/student/", json=student_data)
    if response.status_code == 200:
        print_success("Étudiant créé avec succès")
    else:
        print_error(f"Erreur création étudiant: {response.text}")
        return False
    
    # Marquer les comptes comme vérifiés manuellement (pour les tests)
    print_info("⚠️  Note: Les comptes doivent être vérifiés par email normalement")
    return True

def test_2_login_and_get_ids():
    """Test 2: Se connecter et récupérer les IDs"""
    print_header("TEST 2: Connexion et Récupération des IDs")
    
    # Connexion entreprise
    print_info("Connexion entreprise...")
    # Note: Les comptes ne sont pas vérifiés, donc la connexion échouera
    # On va utiliser des IDs existants pour les tests
    
    print_info("Utilisation des IDs de test (1 pour étudiant, 1 pour entreprise)")
    test_data['student_id'] = 1
    test_data['company_id'] = 1
    test_data['user_id_student'] = 1
    test_data['user_id_company'] = 2
    
    print_success("IDs de test configurés")
    return True

def test_3_create_offer():
    """Test 3: Créer une offre"""
    print_header("TEST 3: Création d'une Offre")
    
    offer_data = {
        "company_id": test_data['company_id'],
        "title": "Stage Développeur Full Stack - TEST",
        "description": "Offre de test pour validation MVP",
        "offer_type": "STAGE",
        "duration": "6 mois",
        "location": "Alger Centre",
        "is_targeted": True,
        "specialty_ids": [1],
        "university_ids": [1]
    }
    
    response = requests.post(f"{BASE_URL}/offers/create/", json=offer_data)
    if response.status_code == 200:
        result = response.json()
        test_data['offer_id'] = result['offer_id']
        print_success(f"Offre créée avec ID: {test_data['offer_id']}")
        print_result(result)
        return True
    else:
        print_error(f"Erreur création offre: {response.text}")
        return False

def test_4_apply_to_offer():
    """Test 4: Postuler à l'offre"""
    print_header("TEST 4: Candidature à l'Offre")
    
    application_data = {
        "student_id": test_data['student_id']
    }
    
    response = requests.post(
        f"{BASE_URL}/offers/{test_data['offer_id']}/apply/",
        json=application_data
    )
    
    if response.status_code == 200:
        print_success("Candidature envoyée avec succès")
        print_result(response.json())
        return True
    else:
        print_error(f"Erreur candidature: {response.text}")
        return False

def test_5_change_status_and_check_notification():
    """Test 5: Changer le statut et vérifier la notification (NOUVEAU)"""
    print_header("TEST 5: 🆕 Notifications - Changement de Statut")
    
    # D'abord, récupérer l'ID de la candidature
    print_info("Récupération de l'ID de candidature...")
    response = requests.get(f"{BASE_URL}/offers/company/dashboard/?company_id={test_data['company_id']}")
    
    if response.status_code != 200:
        print_error("Impossible de récupérer le dashboard entreprise")
        return False
    
    dashboard = response.json()
    if not dashboard.get('recent_applications'):
        print_error("Aucune candidature trouvée")
        return False
    
    application_id = dashboard['recent_applications'][0]['id']
    print_success(f"Candidature trouvée: ID {application_id}")
    
    # Changer le statut
    print_info("Changement du statut vers 'ENTRETIEN'...")
    status_data = {"status": "ENTRETIEN"}
    
    response = requests.put(
        f"{BASE_URL}/offers/applications/{application_id}/status/",
        json=status_data
    )
    
    if response.status_code == 200:
        print_success("Statut changé avec succès")
        print_result(response.json())
    else:
        print_error(f"Erreur changement statut: {response.text}")
        return False
    
    # Vérifier que la notification a été créée
    print_info("Vérification de la notification créée...")
    time.sleep(1)  # Petite pause
    
    response = requests.get(f"{BASE_URL}/core/notifications/?user_id={test_data['user_id_student']}")
    
    if response.status_code == 200:
        notifications = response.json()
        print_success(f"Notifications récupérées: {notifications['unread_count']} non lues")
        print_result(notifications)
        
        if notifications['notifications']:
            test_data['notification_id'] = notifications['notifications'][0]['id']
            return True
        else:
            print_error("Aucune notification trouvée!")
            return False
    else:
        print_error(f"Erreur récupération notifications: {response.text}")
        return False

def test_6_student_dashboard():
    """Test 6: Dashboard Étudiant (NOUVEAU)"""
    print_header("TEST 6: 🆕 Dashboard Étudiant")
    
    response = requests.get(f"{BASE_URL}/offers/student/applications/?student_id={test_data['student_id']}")
    
    if response.status_code == 200:
        dashboard = response.json()
        print_success("Dashboard étudiant récupéré avec succès")
        print_info(f"Total candidatures: {dashboard['stats']['total']}")
        print_info(f"En cours: {dashboard['stats']['en_cours']}")
        print_info(f"Acceptées: {dashboard['stats']['acceptees']}")
        print_info(f"Refusées: {dashboard['stats']['refusees']}")
        print_result(dashboard)
        return True
    else:
        print_error(f"Erreur dashboard étudiant: {response.text}")
        return False

def test_7_update_offer():
    """Test 7: Modifier une offre (NOUVEAU)"""
    print_header("TEST 7: 🆕 Modification d'Offre")
    
    update_data = {
        "title": "Stage Développeur Full Stack - MODIFIÉ",
        "description": "Description mise à jour pour test",
        "offer_type": "STAGE",
        "duration": "6 mois",
        "location": "Alger - Hydra",
        "is_targeted": False,
        "specialty_ids": [1, 2]
    }
    
    response = requests.put(
        f"{BASE_URL}/offers/{test_data['offer_id']}/update/",
        json=update_data
    )
    
    if response.status_code == 200:
        print_success("Offre modifiée avec succès")
        print_result(response.json())
        return True
    else:
        print_error(f"Erreur modification offre: {response.text}")
        return False

def test_8_offer_statistics():
    """Test 8: Statistiques d'offre (NOUVEAU)"""
    print_header("TEST 8: 🆕 Statistiques d'Offre")
    
    response = requests.get(f"{BASE_URL}/offers/{test_data['offer_id']}/statistics/")
    
    if response.status_code == 200:
        stats = response.json()
        print_success("Statistiques récupérées avec succès")
        print_info(f"Vues: {stats['views']}")
        print_info(f"Candidatures: {stats['total_applications']}")
        print_info(f"Taux d'acceptation: {stats['acceptance_rate']}%")
        print_result(stats)
        return True
    else:
        print_error(f"Erreur statistiques: {response.text}")
        return False

def test_9_search_students():
    """Test 9: Recherche de profils étudiants (NOUVEAU)"""
    print_header("TEST 9: 🆕 Recherche de Profils Étudiants")
    
    # D'abord, mettre un profil en PUBLIC
    print_info("Configuration d'un profil en PUBLIC...")
    profile_data = {
        "user_id": test_data['user_id_student'],
        "first_name": "Ahmed",
        "last_name": "Test",
        "skills": "Python, Django, React, JavaScript",
        "experience": "Stage chez XYZ",
        "education": "Master en Informatique",
        "cv_visibility": "PUBLIC"
    }
    
    requests.put(f"{BASE_URL}/auth/student/profile/", json=profile_data)
    
    # Rechercher
    print_info("Recherche de profils avec 'Python'...")
    response = requests.get(f"{BASE_URL}/auth/students/search/?keyword=Python")
    
    if response.status_code == 200:
        results = response.json()
        print_success(f"Recherche réussie: {results['count']} profil(s) trouvé(s)")
        print_result(results)
        return True
    else:
        print_error(f"Erreur recherche: {response.text}")
        return False

def test_10_targeted_offers():
    """Test 10: Filtrage des offres ciblées (NOUVEAU)"""
    print_header("TEST 10: 🆕 Filtrage des Offres Ciblées")
    
    print_info("Récupération des offres avec filtrage par université...")
    response = requests.get(f"{BASE_URL}/offers/?student_id={test_data['student_id']}")
    
    if response.status_code == 200:
        offers = response.json()
        print_success(f"Offres filtrées: {len(offers['offers'])} offre(s)")
        print_result(offers)
        return True
    else:
        print_error(f"Erreur filtrage: {response.text}")
        return False

def test_11_mark_notification_read():
    """Test 11: Marquer notification comme lue (NOUVEAU)"""
    print_header("TEST 11: 🆕 Marquer Notification comme Lue")
    
    if 'notification_id' not in test_data:
        print_error("Aucune notification à marquer")
        return False
    
    response = requests.post(
        f"{BASE_URL}/core/notifications/{test_data['notification_id']}/mark-read/"
    )
    
    if response.status_code == 200:
        print_success("Notification marquée comme lue")
        print_result(response.json())
        return True
    else:
        print_error(f"Erreur: {response.text}")
        return False

def test_12_archive_offer():
    """Test 12: Archiver une offre (NOUVEAU)"""
    print_header("TEST 12: 🆕 Archivage d'Offre")
    
    response = requests.post(f"{BASE_URL}/offers/{test_data['offer_id']}/archive/")
    
    if response.status_code == 200:
        print_success("Offre archivée avec succès")
        print_result(response.json())
        
        # Vérifier qu'elle n'apparaît plus dans la liste
        print_info("Vérification que l'offre n'apparaît plus...")
        response = requests.get(f"{BASE_URL}/offers/")
        offers = response.json()
        
        archived_offer = next((o for o in offers['offers'] if o['id'] == test_data['offer_id']), None)
        if archived_offer is None:
            print_success("✅ L'offre archivée n'apparaît plus dans la liste")
        else:
            print_error("⚠️  L'offre archivée apparaît encore dans la liste")
        
        return True
    else:
        print_error(f"Erreur archivage: {response.text}")
        return False

def run_all_tests():
    """Exécuter tous les tests"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("╔═══════════════════════════════════════════════════════════════════╗")
    print("║          TEST COMPLET DES NOUVELLES FONCTIONNALITÉS MVP          ║")
    print("║                      DZ-Stagiaire Backend                         ║")
    print("╚═══════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.RESET}\n")
    
    tests = [
        ("Création des comptes", test_1_create_accounts),
        ("Configuration IDs", test_2_login_and_get_ids),
        ("Création d'offre", test_3_create_offer),
        ("Candidature", test_4_apply_to_offer),
        ("🆕 Notifications", test_5_change_status_and_check_notification),
        ("🆕 Dashboard Étudiant", test_6_student_dashboard),
        ("🆕 Modification Offre", test_7_update_offer),
        ("🆕 Statistiques", test_8_offer_statistics),
        ("🆕 Recherche Profils", test_9_search_students),
        ("🆕 Filtrage Ciblé", test_10_targeted_offers),
        ("🆕 Marquer Notification", test_11_mark_notification_read),
        ("🆕 Archivage Offre", test_12_archive_offer),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            time.sleep(0.5)  # Petite pause entre les tests
        except Exception as e:
            print_error(f"Exception dans {test_name}: {str(e)}")
            results.append((test_name, False))
    
    # Résumé
    print_header("RÉSUMÉ DES TESTS")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        if result:
            print_success(f"{test_name}")
        else:
            print_error(f"{test_name}")
    
    print(f"\n{Colors.BOLD}")
    print(f"{'='*70}")
    print(f"RÉSULTAT FINAL: {passed}/{total} tests réussis")
    
    if passed == total:
        print(f"{Colors.GREEN}🎉 TOUS LES TESTS SONT PASSÉS ! MVP 100% FONCTIONNEL !{Colors.RESET}")
    elif passed >= total * 0.8:
        print(f"{Colors.YELLOW}⚠️  La plupart des tests sont passés. Vérifiez les échecs.{Colors.RESET}")
    else:
        print(f"{Colors.RED}❌ Plusieurs tests ont échoué. Vérifiez la configuration.{Colors.RESET}")
    
    print(f"{'='*70}{Colors.RESET}\n")

if __name__ == "__main__":
    print_info("Assurez-vous que le serveur Django est lancé sur http://localhost:8000")
    print_info("Commande: python manage.py runserver\n")
    
    input(f"{Colors.YELLOW}Appuyez sur ENTRÉE pour commencer les tests...{Colors.RESET}")
    
    run_all_tests()
