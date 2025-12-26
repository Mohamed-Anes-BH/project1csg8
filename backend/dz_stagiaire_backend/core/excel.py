import openpyxl
from core.db import execute_query, queries


def parse_excel_file(file):
    """
    Parse un fichier Excel contenant des offres.
    Colonnes attendues: title, type, duration, description, skills, location
    """
    offers = []
    try:
        workbook = openpyxl.load_workbook(file)
        sheet = workbook.active
        
        # Get header row to map columns
        headers = []
        for cell in sheet[1]:
            if cell.value:
                headers.append(str(cell.value).lower().strip())
            else:
                headers.append('')
        
        # Map expected columns
        column_map = {
            'title': None,
            'type': None,
            'duration': None,
            'description': None,
            'skills': None,
            'location': None
        }
        
        # Find column indices
        for i, header in enumerate(headers):
            if header in column_map:
                column_map[header] = i
            # Handle common variations
            elif header in ['titre', 'nom', 'intitulé']:
                column_map['title'] = i
            elif header in ['type_offre', 'type offre']:
                column_map['type'] = i
            elif header in ['durée', 'duree']:
                column_map['duration'] = i
            elif header in ['compétences', 'competences']:
                column_map['skills'] = i
            elif header in ['ville', 'lieu', 'localisation']:
                column_map['location'] = i
        
        # Parse data rows
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not row[0]:  # Skip empty rows
                continue
            
            offer = {}
            
            for field, col_idx in column_map.items():
                if col_idx is not None and col_idx < len(row):
                    value = row[col_idx]
                    if value is not None:
                        offer[field] = str(value).strip()
                    else:
                        offer[field] = None
                else:
                    offer[field] = None
            
            # Validate type
            if offer.get('type'):
                offer['type'] = offer['type'].upper()
                if offer['type'] not in ['STAGE', 'PFE']:
                    offer['type'] = 'STAGE'  # Default
            else:
                offer['type'] = 'STAGE'
            
            offers.append(offer)
            
        return offers
    except Exception as e:
        print(f"Erreur parsing Excel: {e}")
        return None


def validate_excel_columns(data):
    """
    Valide que les données parsées contiennent les champs requis.
    """
    required_fields = ['title', 'type', 'description']
    
    for row in data:
        for field in required_fields:
            if field not in row or not row[field]:
                return False
    return True


def insert_offers_from_excel(company_id, offers):
    """
    Insère plusieurs offres en base de données.
    Les offres sont créées en mode brouillon.
    """
    count = 0
    errors = []
    
    for i, offer in enumerate(offers):
        try:
            params = (
                company_id, 
                offer.get('title', ''),
                offer.get('description', ''),
                offer.get('type', 'STAGE'),
                offer.get('duration'),
                offer.get('location'),
                offer.get('skills')
            )
            execute_query(queries['create_offer_draft'], params, commit=True)
            count += 1
        except Exception as e:
            errors.append(f"Ligne {i+2}: {str(e)}")
    
    if errors:
        print(f"Erreurs d'import: {errors}")
    
    return count


def generate_excel_template():
    """
    Génère un template Excel pour l'import d'offres.
    Retourne les données pour créer un fichier template.
    """
    template = {
        'headers': ['title', 'type', 'duration', 'description', 'skills', 'location'],
        'example_row': [
            'Développeur Web',
            'STAGE',
            '3 mois',
            'Stage en développement web avec React et Node.js',
            'React, Node.js, JavaScript, HTML, CSS',
            'Alger'
        ]
    }
    return template
