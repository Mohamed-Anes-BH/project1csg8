import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dzstagiaire.settings')
django.setup()

from accounts.db_utils import execute_query, execute_query_one

def print_section(title):
    print(f"\n{'='*60}")
    print(f"📊 {title}")
    print(f"{'='*60}")

def test_database():
    """Test complet de la base de données"""
    
    # 1. Test des tables Core
    print_section("TABLES CORE (Données de référence)")
    
    universities = execute_query("SELECT COUNT(*) as count FROM universities")
    print(f"✅ Universités : {universities[0]['count']} enregistrements")
    
    domains = execute_query("SELECT COUNT(*) as count FROM domains")
    print(f"✅ Domaines : {domains[0]['count']} enregistrements")
    
    specialties = execute_query("SELECT COUNT(*) as count FROM specialties")
    print(f"✅ Spécialités : {specialties[0]['count']} enregistrements")
    
    # Afficher quelques universités
    print("\n📚 Exemples d'universités :")
    unis = execute_query("SELECT name, city FROM universities LIMIT 3")
    for uni in unis:
        print(f"   - {uni['name']} ({uni['city']})")
    
    # 2. Test des utilisateurs
    print_section("UTILISATEURS")
    
    users = execute_query("SELECT COUNT(*) as count FROM users")
    print(f"✅ Total utilisateurs : {users[0]['count']}")
    
    students = execute_query("SELECT COUNT(*) as count FROM users WHERE user_type = 'STUDENT'")
    print(f"   - Étudiants : {students[0]['count']}")
    
    companies = execute_query("SELECT COUNT(*) as count FROM users WHERE user_type = 'COMPANY'")
    print(f"   - Entreprises : {companies[0]['count']}")
    
    verified = execute_query("SELECT COUNT(*) as count FROM users WHERE is_verified = TRUE")
    print(f"   - Comptes vérifiés : {verified[0]['count']}")
    
    # Derniers utilisateurs
    print("\n👥 Derniers utilisateurs inscrits :")
    recent_users = execute_query("""
        SELECT email, user_type, is_verified, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 3
    """)
    for user in recent_users:
        status = "✓ Vérifié" if user['is_verified'] else "⏳ Non vérifié"
        print(f"   - {user['email']} ({user['user_type']}) - {status}")
    
    # 3. Test des profils
    print_section("PROFILS")
    
    student_profiles = execute_query("SELECT COUNT(*) as count FROM student_profiles")
    print(f"✅ Profils étudiants : {student_profiles[0]['count']}")
    
    company_profiles = execute_query("SELECT COUNT(*) as count FROM company_profiles")
    print(f"✅ Profils entreprises : {company_profiles[0]['count']}")
    
    # Exemple de profil étudiant complet
    student = execute_query_one("""
        SELECT sp.first_name, sp.last_name, u.name as university, d.name as domain, s.name as specialty
        FROM student_profiles sp
        LEFT JOIN universities u ON sp.university_id = u.id
        LEFT JOIN domains d ON sp.domain_id = d.id
        LEFT JOIN specialties s ON sp.specialty_id = s.id
        LIMIT 1
    """)
    if student:
        print(f"\n🎓 Exemple de profil étudiant :")
        print(f"   Nom : {student['first_name']} {student['last_name']}")
        print(f"   Université : {student['university']}")
        print(f"   Domaine : {student['domain']}")
        print(f"   Spécialité : {student['specialty']}")
    
    # 4. Test des offres
    print_section("OFFRES")
    
    offers = execute_query("SELECT COUNT(*) as count FROM offers")
    print(f"✅ Total offres : {offers[0]['count']}")
    
    active_offers = execute_query("SELECT COUNT(*) as count FROM offers WHERE is_active = 1")
    print(f"   - Offres actives : {active_offers[0]['count']}")
    
    # Répartition par type
    print("\n📋 Répartition par type :")
    types = execute_query("""
        SELECT offer_type, COUNT(*) as count 
        FROM offers 
        GROUP BY offer_type
    """)
    for t in types:
        print(f"   - {t['offer_type']} : {t['count']}")
    
    # Dernières offres
    print("\n💼 Dernières offres publiées :")
    recent_offers = execute_query("""
        SELECT o.title, o.offer_type, o.location, c.company_name, o.created_at
        FROM offers o
        JOIN company_profiles c ON o.company_id = c.id
        ORDER BY o.created_at DESC
        LIMIT 3
    """)
    for offer in recent_offers:
        print(f"   - {offer['title']} ({offer['offer_type']}) - {offer['company_name']} - {offer['location']}")
    
    # 5. Test des candidatures
    print_section("CANDIDATURES")
    
    applications = execute_query("SELECT COUNT(*) as count FROM applications")
    print(f"✅ Total candidatures : {applications[0]['count']}")
    
    # Répartition par statut
    print("\n📊 Répartition par statut :")
    statuses = execute_query("""
        SELECT status, COUNT(*) as count 
        FROM applications 
        GROUP BY status
    """)
    for s in statuses:
        print(f"   - {s['status']} : {s['count']}")
    
    # Dernières candidatures
    if applications[0]['count'] > 0:
        print("\n📬 Dernières candidatures :")
        recent_apps = execute_query("""
            SELECT o.title, s.first_name, s.last_name, a.status, a.applied_at
            FROM applications a
            JOIN offers o ON a.offer_id = o.id
            JOIN student_profiles s ON a.student_id = s.id
            ORDER BY a.applied_at DESC
            LIMIT 3
        """)
        for app in recent_apps:
            print(f"   - {app['first_name']} {app['last_name']} → {app['title']} ({app['status']})")
    
    # 6. Test des tokens de vérification
    print_section("TOKENS DE VÉRIFICATION")
    
    tokens = execute_query("SELECT COUNT(*) as count FROM verification_tokens")
    print(f"✅ Tokens actifs : {tokens[0]['count']}")
    
    # Tokens expirés
    expired = execute_query("""
        SELECT COUNT(*) as count 
        FROM verification_tokens 
        WHERE expires_at < NOW()
    """)
    print(f"   - Tokens expirés : {expired[0]['count']}")
    
    # 7. Statistiques globales
    print_section("STATISTIQUES GLOBALES")
    
    # Taux de vérification
    if users[0]['count'] > 0:
        verification_rate = (verified[0]['count'] / users[0]['count']) * 100
        print(f"📈 Taux de vérification email : {verification_rate:.1f}%")
    
    # Taux de candidature
    if offers[0]['count'] > 0 and students[0]['count'] > 0:
        avg_apps_per_offer = applications[0]['count'] / offers[0]['count']
        print(f"📈 Moyenne candidatures par offre : {avg_apps_per_offer:.1f}")
    
    print("\n" + "="*60)
    print("✅ TEST DE LA BASE DE DONNÉES TERMINÉ")
    print("="*60)

if __name__ == "__main__":
    try:
        test_database()
    except Exception as e:
        print(f"\n❌ Erreur lors du test : {e}")
        sys.exit(1)
