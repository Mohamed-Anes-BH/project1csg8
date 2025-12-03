# 🚀 DZ-Stagiaire - Backend MySQL avec SQL Pur

Plateforme de stages et PFE pour l'Algérie - Implémentation avec **SQL pur** (sans ORM Django).

## 📋 Structure du Projet

```
backend/
├── dzstagiaire/              # Configuration Django
│   ├── settings.py          # ✅ Configuré pour MySQL
│   └── urls.py
│
├── core/                     # Données de référence
│   ├── sql/
│   │   ├── create_tables.sql    # Tables: universities, domains, specialties
│   │   └── insert_data.sql      # Données d'exemple
│   ├── db_utils.py              # Fonctions SQL helper
│   └── views.py
│
├── accounts/                 # Gestion utilisateurs
│   ├── sql/
│   │   └── create_tables.sql    # Tables: users, student_profiles, company_profiles
│   ├── db_utils.py
│   └── views.py
│
├── offers/                   # Gestion offres
│   ├── sql/
│   │   └── create_tables.sql    # Tables: offers, applications, etc.
│   ├── db_utils.py
│   └── views.py
│
└── init_database.py          # 🔧 Script d'initialisation DB
```

## 🗄️ Base de Données MySQL

### Tables Créées (10 tables)

#### **Core** (3 tables)
- `universities` - Universités algériennes
- `domains` - Domaines d'études
- `specialties` - Spécialités par domaine

#### **Accounts** (3 tables)
- `users` - Utilisateurs (STUDENT/COMPANY)
- `student_profiles` - Profils étudiants avec CV
- `company_profiles` - Profils entreprises

#### **Offers** (4 tables)
- `offers` - Offres de stage/PFE/emploi
- `applications` - Candidatures avec statuts
- `offer_specialties` - Spécialités recherchées (many-to-many)
- `offer_universities` - Ciblage par université (many-to-many)

## 🐳 Démarrage avec Docker (Recommandé)

### 1. Lancer la base de données MySQL
```bash
docker-compose up -d
```

### 2. Initialiser la base de données
```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Créer les tables et insérer les données
python init_database.py
```

### 3. Lancer le serveur Django
```bash
python manage.py runserver
```

---

## 🔧 Installation

### 1. Prérequis
- Python 3.8+
- MySQL 5.7+ ou MariaDB 10.3+
- pip

### 2. Installer les dépendances

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configurer MySQL

**Option A: Créer manuellement la base de données**
```sql
CREATE DATABASE dzstagiaire CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dzstagiaire_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON dzstagiaire.* TO 'dzstagiaire_user'@'localhost';
FLUSH PRIVILEGES;
```

**Option B: Utiliser root (développement uniquement)**
- Modifier `dzstagiaire/settings.py` ligne 85-86
- Mettre votre mot de passe MySQL root

### 4. Initialiser la base de données

```bash
python init_database.py
```

Ce script va :
- ✅ Créer la base de données `dzstagiaire`
- ✅ Créer toutes les tables (10 tables)
- ✅ Insérer les données d'exemple (universités, domaines, spécialités)

## 💻 Utilisation du SQL Pur

### Exemple 1: Récupérer toutes les offres actives

```python
# Dans offers/views.py
from django.http import JsonResponse
from .db_utils import execute_query

def get_offers(request):
    query = """
        SELECT o.*, c.company_name 
        FROM offers o
        JOIN company_profiles c ON o.company_id = c.id
        WHERE o.is_active = 1
        ORDER BY o.created_at DESC
    """
    offers = execute_query(query)
    return JsonResponse({'offers': offers})
```

### Exemple 2: Créer une nouvelle offre

```python
from .db_utils import execute_update

def create_offer(request):
    query = """
        INSERT INTO offers (company_id, title, description, offer_type, duration)
        VALUES (%s, %s, %s, %s, %s)
    """
    params = (
        request.POST['company_id'],
        request.POST['title'],
        request.POST['description'],
        request.POST['offer_type'],
        request.POST['duration']
    )
    offer_id = execute_update(query, params)
    return JsonResponse({'success': True, 'offer_id': offer_id})
```

### Exemple 3: Recherche avec filtres

```python
def search_offers(request):
    keyword = request.GET.get('keyword', '')
    offer_type = request.GET.get('type', '')
    
    query = """
        SELECT * FROM offers 
        WHERE is_active = 1
        AND title LIKE %s
    """
    params = [f'%{keyword}%']
    
    if offer_type:
        query += " AND offer_type = %s"
        params.append(offer_type)
    
    offers = execute_query(query, params)
    return JsonResponse({'offers': offers})
```

## 🛠️ Fonctions Helper Disponibles

Dans chaque `db_utils.py` :

```python
# SELECT - Plusieurs résultats
execute_query(query, params)

# SELECT - Un seul résultat
execute_query_one(query, params)

# INSERT/UPDATE/DELETE
execute_update(query, params)

# INSERT multiple
execute_many(query, params_list)

# Exécuter un fichier SQL
execute_script(sql_file_path)
```

## 📊 Schéma de Base de Données

### Relations Principales

```
universities ──┐
               ├──> student_profiles ──> users
domains ───────┤                          │
               │                          │
specialties ───┴──> offer_specialties    │
                         │                │
                         ├──> offers <────┤
                         │        │       │
                         │        └──> applications
                         │             
                    offer_universities
                         │
universities ────────────┘
```

## 🎯 Contraintes Métier Implémentées

### 1. Cycle de vie des candidatures
- ✅ 5 statuts: REÇUE → EN_COURS → ENTRETIEN → ACCEPTÉE/REFUSÉE
- ✅ Timestamps automatiques (applied_at, updated_at)

### 2. Ciblage par établissement
- ✅ Table `offer_universities` pour le ciblage
- ✅ Si `is_targeted = TRUE`, seuls les étudiants des universités ciblées voient l'offre

### 3. Matching par spécialité
- ✅ Table `offer_specialties` pour les spécialités recherchées
- ✅ Permet de recommander les offres correspondant au profil étudiant

## 🚀 Lancer le Serveur

```bash
source venv/bin/activate
python manage.py runserver
```

## 📝 Prochaines Étapes

1. ✅ Base de données créée
2. ⏳ Créer les vues (views.py) pour chaque app
3. ⏳ Créer les templates HTML
4. ⏳ Configurer les URLs
5. ⏳ Implémenter l'authentification
6. ⏳ Créer les formulaires

## 🔍 Vérifier l'Installation

```bash
# Tester la connexion MySQL
python manage.py check

# Voir les tables créées
mysql -u root -p dzstagiaire -e "SHOW TABLES;"
```

## 📚 Ressources

- [Documentation PyMySQL](https://pymysql.readthedocs.io/)
- [MySQL Reference Manual](https://dev.mysql.com/doc/)
- [Django Database Access](https://docs.djangoproject.com/en/5.2/topics/db/sql/)

---

**Développé pour le projet DZ-Stagiaire - Approche SQL Pure** 🇩🇿
