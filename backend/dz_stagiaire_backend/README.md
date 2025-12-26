# DZ-Stagiaire Backend

API Backend complète pour la plateforme DZ-Stagiaire - Mise en relation entre étudiants et entreprises pour les stages et PFE.

## 🏗️ Architecture

Ce projet utilise une architecture en couches avec Django REST Framework comme couche web et SQL brut via `mysql-connector-python` pour l'accès aux données (sans ORM Django).

### Structure des modules

```
dz_stagiaire_backend/
├── accounts/          # Authentification & comptes utilisateurs
├── students/          # Profils étudiants & dashboard
├── companies/         # Profils entreprises & dashboard
├── offers/            # Gestion des offres de stage/PFE
├── applications/      # Candidatures
├── messaging/         # Messagerie entre utilisateurs
├── notifications/     # Notifications in-app & email
├── admin_panel/       # Panel d'administration
├── core/              # Utilitaires partagés
│   ├── db.py          # Connexion DB & exécution SQL
│   ├── auth.py        # Authentification JWT
│   ├── security.py    # Hashage mots de passe
│   ├── email.py       # Service email SMTP
│   ├── notifications.py   # Création de notifications
│   ├── excel.py       # Import Excel
│   ├── utils.py       # Utilitaires divers
│   └── logs.py        # Logs métier
└── sql/
    ├── schema.sql     # Schéma de la base de données
    └── query.sql      # Requêtes SQL nommées
```

## 🔐 Fonctionnalités d'Authentification

- **Inscription** Étudiant / Entreprise
- **Connexion** avec JWT
- **Déconnexion**
- **Vérification email** par lien (token)
- **Renvoi email de vérification**
- **Réinitialisation mot de passe**
- **Changement mot de passe**
- **Gestion des rôles** (STUDENT / COMPANY / ADMIN)
- **Blocage compte** si email non vérifié

## 👤 Fonctionnalités Étudiant

- Dashboard avec statistiques
- Profil complet (bio, titre, compétences, formations, expériences)
- Upload/Téléchargement CV (PDF)
- Liens externes (LinkedIn, GitHub)
- Profil public/privé
- Indicateur de complétion du profil
- Offres sauvegardées (favoris)
- Recommandations basées sur les compétences
- Paramètres personnels

## 🏢 Fonctionnalités Entreprise

- Dashboard avec statistiques avancées
- Profil entreprise complet
- Upload logo
- Gestion des offres (CRUD)
- Workflow: Brouillon → Publié → Clôturé → Archivé
- Import offres via Excel
- Duplication d'offres
- Gestion des candidatures reçues
- Filtres par statut/offre
- Téléchargement CV des candidats
- Notes internes sur candidatures

## 📄 Gestion des Offres

- Création (brouillon ou publiée)
- Modification
- Publication
- Clôture
- Archivage
- Suppression logique
- Import Excel
- Duplication
- Recherche globale
- Filtres (type, durée, localisation)
- Tri (récent, populaire)
- Pagination

## 📬 Candidatures

- Postuler à une offre
- Une seule candidature par offre
- Suivi des statuts :
  - En attente (PENDING)
  - Présélectionné (PRESELECTED)
  - Accepté (ACCEPTED)
  - Refusé (REJECTED)
  - Archivé (ARCHIVED)
- Retrait de candidature
- Historique complet
- Notes internes (entreprise)
- Notifications automatiques

## 💬 Messagerie

- Création automatique de conversations
- Liste des conversations
- Envoi de messages
- Historique des échanges
- Compteur messages non lus
- Notifications sur nouveaux messages

## 🔔 Notifications

- Notifications in-app
- Emails optionnels (activables/désactivables)
- Types :
  - Nouvelle candidature
  - Changement de statut
  - Nouveau message
  - Rappel profil incomplet
  - Nouvelle offre recommandée
- Badge compteur non lues
- Marquer comme lu (une ou toutes)
- Suppression

## 🛠️ Administration

- Statistiques globales
- Gestion utilisateurs (activation/suspension)
- Modération des offres
- Envoi de notifications groupées
- Consultation des logs métier
- Liste des profils incomplets

## 📊 Import Excel

Format attendu pour l'import d'offres :

| title | type | duration | description | skills | location |
|-------|------|----------|-------------|--------|----------|
| Dev Web | STAGE | 3 mois | Description... | React, Node.js | Alger |

## 🚀 Installation

### Prérequis

- Python 3.10+
- MySQL 8.0+
- pip

### Étapes

1. **Créer l'environnement virtuel**
```bash
cd backend/dz_stagiaire_backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

4. **Créer la base de données**
```sql
CREATE DATABASE dz_stagiaire CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Importer le schéma**
```bash
mysql -u root -p dz_stagiaire < sql/schema.sql
```

6. **Lancer le serveur**
```bash
python manage.py runserver
```

## 📝 Variables d'environnement

```env
# Django
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True

# Database
DB_USER=root
DB_PASSWORD=your-password
DB_HOST=localhost
DB_NAME=dz_stagiaire

# JWT
JWT_SECRET_KEY=your-jwt-secret

# Email SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 🔧 Commandes de gestion

```bash
# Expirer les offres dépassées
python manage.py expire_offers

# Envoyer les rappels de profil incomplet
python manage.py send_profile_reminders
```

## 📡 Endpoints API

### Authentification (`/api/auth/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register/student/` | Inscription étudiant |
| POST | `/register/company/` | Inscription entreprise |
| POST | `/login/` | Connexion |
| POST | `/logout/` | Déconnexion |
| GET/POST | `/verify-email/` | Vérification email |
| POST | `/resend-verification/` | Renvoyer email vérification |
| POST | `/forgot-password/` | Demande reset password |
| POST | `/reset-password/` | Reset password avec token |
| POST | `/change-password/` | Changer mot de passe |
| GET | `/me/` | Utilisateur courant |
| GET/PATCH | `/toggle-alerts/` | Alertes email |

### Étudiants (`/api/students/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard/` | Dashboard étudiant |
| GET/PUT | `/profile/` | Profil personnel |
| GET | `/profile/<id>/` | Profil public |
| GET/PATCH | `/visibility/` | Visibilité profil |
| GET/PATCH | `/settings/` | Paramètres |
| POST/DELETE | `/upload-cv/` | CV PDF |
| GET/POST | `/saved-offers/` | Favoris |
| DELETE | `/saved-offers/<id>/` | Retirer favori |
| GET | `/recommendations/` | Recommandations |

### Entreprises (`/api/companies/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard/` | Dashboard entreprise |
| GET/PUT | `/profile/` | Profil entreprise |
| GET | `/profile/<id>/` | Profil public |
| POST/DELETE | `/upload-logo/` | Logo |
| GET | `/my-offers/` | Mes offres |
| GET | `/applications/` | Candidatures reçues |
| GET | `/download-cv/<id>/` | Télécharger CV |
| GET/PATCH | `/settings/` | Paramètres |

### Offres (`/api/offers/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste/Recherche offres |
| POST | `/` | Créer offre |
| GET/PUT | `/<id>/` | Détail/Modifier |
| PATCH | `/<id>/publish/` | Publier |
| PATCH | `/<id>/close/` | Clôturer |
| PATCH | `/<id>/archive/` | Archiver |
| DELETE | `/<id>/delete/` | Supprimer |
| POST | `/<id>/duplicate/` | Dupliquer |
| POST | `/import/` | Import Excel |

### Candidatures (`/api/applications/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste candidatures |
| GET | `/stats/` | Statistiques |
| POST | `/apply/` | Postuler |
| GET | `/<id>/` | Détail |
| PATCH | `/<id>/status/` | Modifier statut |
| DELETE | `/<id>/withdraw/` | Retirer |

### Messagerie (`/api/messaging/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/conversations/` | Liste conversations |
| GET/DELETE | `/conversations/<id>/` | Détail/Supprimer |
| GET | `/conversations/<id>/messages/` | Messages |
| POST | `/send/` | Envoyer message |
| POST | `/start/` | Démarrer conversation |
| GET | `/unread-count/` | Messages non lus |

### Notifications (`/api/notifications/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste notifications |
| GET | `/stats/` | Compteur non lues |
| PATCH | `/<id>/read/` | Marquer lue |
| PATCH | `/read-all/` | Tout marquer lu |
| DELETE | `/<id>/delete/` | Supprimer |
| DELETE | `/delete-read/` | Supprimer lues |
| GET/PATCH | `/preferences/` | Préférences |

### Administration (`/api/admin/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/stats/` | Statistiques globales |
| GET | `/users/` | Liste utilisateurs |
| GET | `/users/<id>/` | Détail utilisateur |
| PATCH | `/users/<id>/toggle/` | Activer/Désactiver |
| PATCH | `/users/<id>/suspend/` | Suspendre |
| GET | `/offers/` | Liste offres |
| GET | `/offers/<id>/` | Détail offre |
| DELETE | `/offers/<id>/delete/` | Supprimer offre |
| GET | `/logs/` | Logs métier |
| POST | `/send-notification/` | Envoyer notification |
| GET | `/incomplete-profiles/` | Profils incomplets |

## 🔒 Sécurité

- Mots de passe hashés avec **bcrypt**
- Tokens JWT signés et avec expiration
- Requêtes SQL paramétrées (protection injection SQL)
- Permissions par rôle
- Validation des entrées utilisateur
- Messages d'erreur sécurisés

## 📌 Règles métier

- Un étudiant ne peut postuler qu'une seule fois par offre
- Une entreprise ne peut voir que ses propres candidatures
- Un utilisateur ne peut modifier que ses propres données
- Les offres expirent automatiquement
- Les notifications sont créées automatiquement

## 📄 Licence

Projet académique - PFE 2024
