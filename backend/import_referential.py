import os
import sys
import pandas as pd
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dzstagiaire.settings')
django.setup()

from core.db_utils import execute_query_one, execute_update

def import_data(file_path):
    """
    Importe les domaines et spécialités depuis un fichier Excel.
    Format attendu: Colonnes 'Domaine' et 'Spécialité'
    """
    print(f"Lecture du fichier : {file_path}")
    
    try:
        df = pd.read_excel(file_path)
    except Exception as e:
        print(f"Erreur lors de la lecture du fichier : {e}")
        return

    # Vérification des colonnes
    if 'Domaine' not in df.columns or 'Spécialité' not in df.columns:
        print("Erreur : Le fichier doit contenir les colonnes 'Domaine' et 'Spécialité'")
        return

    count_domains = 0
    count_specialties = 0

    for index, row in df.iterrows():
        domain_name = str(row['Domaine']).strip()
        specialty_name = str(row['Spécialité']).strip()

        if not domain_name or not specialty_name:
            continue

        # 1. Gérer le Domaine
        domain = execute_query_one("SELECT id FROM domains WHERE name = %s", [domain_name])
        
        if domain:
            domain_id = domain['id']
        else:
            print(f"Création du domaine : {domain_name}")
            domain_id = execute_update("INSERT INTO domains (name) VALUES (%s)", [domain_name])
            count_domains += 1

        # 2. Gérer la Spécialité
        specialty = execute_query_one(
            "SELECT id FROM specialties WHERE name = %s AND domain_id = %s", 
            [specialty_name, domain_id]
        )
        
        if not specialty:
            print(f"  -> Création de la spécialité : {specialty_name}")
            execute_update(
                "INSERT INTO specialties (name, domain_id) VALUES (%s, %s)", 
                [specialty_name, domain_id]
            )
            count_specialties += 1

    print("\nImport terminé !")
    print(f"Nouveaux domaines : {count_domains}")
    print(f"Nouvelles spécialités : {count_specialties}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python import_referential.py <chemin_vers_fichier_excel>")
    else:
        import_data(sys.argv[1])
