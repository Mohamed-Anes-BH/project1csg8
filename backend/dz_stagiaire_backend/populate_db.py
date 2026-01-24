import os
import sys
import random
import datetime

# Ensure we can import from core (assuming this script is in backend/dz_stagiaire_backend/)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings before importing core modules
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

try:
    from core.db import execute_query
    from core.security import hash_password, generate_verification_code
except ImportError as e:
    print(f"Error importing core modules: {e}")
    print("Make sure you run this script from the backend/dz_stagiaire_backend directory or set PYTHONPATH correctly.")
    sys.exit(1)

def run_population():
    print("Starting database population...")
    
    password_plain = "password123"
    password_hash = hash_password(password_plain)
    
    created_accounts = []
    
    # --- Create 10 Companies ---
    companies = []
    print("Creating companies...")
    for i in range(1, 11):
        email = f"company_{i}@dz-stagiaire.com"
        name = f"Entreprise {i} Tech"
        
        # Check if exists
        existing = execute_query("SELECT id FROM users WHERE email=%s", (email,), fetch_one=True)
        if existing:
            print(f"User {email} already exists, skipping creation.")
            companies.append({'id': existing['id'], 'name': name})
            continue

        user_id = execute_query(
            "INSERT INTO users (email, password_hash, role, is_verified, created_at) VALUES (%s, %s, %s, TRUE, NOW())",
            (email, password_hash, 'COMPANY'),
            commit=True
        )
        
        execute_query(
            "INSERT INTO companies (user_id, name, description, industry, location, size, website) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (user_id, name, f"Description pour {name}. Une entreprise leader dans son domaine.", "Technology", "Alger", "PME", f"https://www.{name.replace(' ', '').lower()}.com"),
            commit=True
        )
        
        companies.append({'id': user_id, 'name': name})
        created_accounts.append(f"COMPANY | Email: {email} | Pass: {password_plain}")

    # --- Create 10 Students ---
    students = []
    print("Creating students...")
    for i in range(1, 11):
        email = f"student_{i}@dz-stagiaire.com"
        first_name = f"Etudiant{i}"
        last_name = f"Nom{i}"
        
        # Check if exists
        existing = execute_query("SELECT id FROM users WHERE email=%s", (email,), fetch_one=True)
        if existing:
            print(f"User {email} already exists, skipping creation.")
            students.append({'id': existing['id']})
            continue

        user_id = execute_query(
            "INSERT INTO users (email, password_hash, role, is_verified, created_at) VALUES (%s, %s, %s, TRUE, NOW())",
            (email, password_hash, 'STUDENT'),
            commit=True
        )
        
        execute_query(
            "INSERT INTO students (user_id, first_name, last_name, title, bio, skills) VALUES (%s, %s, %s, %s, %s, %s)",
            (user_id, first_name, last_name, "Développeur Junior", f"Bio de l'étudiant {i}. Passionné par le code.", "Python, React, SQL"),
            commit=True
        )
        
        students.append({'id': user_id})
        created_accounts.append(f"STUDENT | Email: {email} | Pass: {password_plain}")

    # --- Create 10 Offers per Company ---
    all_offers = []
    print("Creating offers...")
    offer_types = ['STAGE', 'PFE', 'JOB']
    skills_pool = ["Python", "React", "Java", "SQL", "Docker", "AWS", "Figma", "Marketing"]
    
    for company in companies:
        for j in range(1, 11):
            title = f"Offre {j} - {company['name']}"
            offer_type = random.choice(offer_types)
            desc = f"Description de l'offre {j} chez {company['name']}. Venez rejoindre notre équipe dynamique."
            
            offer_id = execute_query(
                "INSERT INTO offers (company_id, title, description, type, duration, location, skills, status, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, 'OPEN', NOW())",
                (company['id'], title, desc, offer_type, "6 mois", "Alger", ", ".join(random.sample(skills_pool, 3))),
                commit=True
            )
            all_offers.append(offer_id)

    # --- Create Random Applications (Candidates) ---
    print("Creating applications...")
    # Each student applies to 5 random offers
    status_pool = ['PENDING', 'ACCEPTED', 'REJECTED', 'PRESELECTED']
    
    for student in students:
        if not all_offers: 
            break
        
        offers_to_apply = random.sample(all_offers, min(len(all_offers), 5))
        
        for offer_id in offers_to_apply:
            # Check existing
            existing = execute_query("SELECT id FROM applications WHERE offer_id=%s AND student_id=%s", (offer_id, student['id']), fetch_one=True)
            if existing:
                continue
                
            status = random.choice(status_pool)
            execute_query(
                "INSERT INTO applications (offer_id, student_id, status, created_at) VALUES (%s, %s, %s, NOW())",
                (offer_id, student['id'], status),
                commit=True
            )

    # --- Write Credentials to File ---
    output_file = "generated_credentials.txt"
    with open(output_file, "w") as f:
        f.write("=== GÉNÉRATION COMPTES DZ-STAGIAIRE ===\n\n")
        
        f.write("--- ENTREPRISES ---\n")
        f.write("\n".join([line for line in created_accounts if "COMPANY" in line]))
        f.write("\n\n")
        
        f.write("--- ÉTUDIANTS ---\n")
        f.write("\n".join([line for line in created_accounts if "STUDENT" in line]))
        f.write("\n\n")
        f.write("Mot de passe pour tous : password123\n")
    
    print(f"\nSUCCESS! 10 Companies, 10 Students, 100 Offers created.")
    print(f"Credentials saved to: {os.path.abspath(output_file)}")

if __name__ == "__main__":
    run_population()
