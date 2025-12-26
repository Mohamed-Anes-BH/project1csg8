# 🚀 Guide de Démarrage Rapide - Nouvelles Fonctionnalités

## ⚡ Démarrage Rapide

### 1. Lancer MySQL
```bash
cd /home/mo-chouli/project1csg8/backend
docker-compose up -d
```

### 2. Migrer la Base de Données
```bash
source venv/bin/activate
python add_missing_features.py
```

### 3. Lancer le Serveur
```bash
python manage.py runserver
```

---

## 📋 Nouveaux Endpoints (12 au total)

### Notifications (3)
```
GET  /api/core/notifications/?user_id=1
POST /api/core/notifications/1/mark-read/
POST /api/core/notifications/mark-all-read/
```

### Dashboard Étudiant (1)
```
GET /api/offers/student/applications/?student_id=1
```

### Gestion Offres (3)
```
PUT    /api/offers/1/update/
POST   /api/offers/1/archive/
DELETE /api/offers/1/delete/
```

### Statistiques (1)
```
GET /api/offers/1/statistics/
```

### Recherche Profils (1)
```
GET /api/auth/students/search/?keyword=Python&specialty_id=1
```

### Ciblage Offres (3 - améliorés)
```
GET /api/offers/?student_id=1
GET /api/offers/?student_id=1&keyword=stage
GET /api/offers/recommended/?student_id=1
```

---

## 🧪 Test Rapide

### Scénario Complet
```bash
# 1. Étudiant postule à une offre
POST /api/offers/1/apply/
{"student_id": 1}

# 2. Entreprise change le statut
PUT /api/offers/applications/1/status/
{"status": "ENTRETIEN"}

# 3. Étudiant voit la notification
GET /api/core/notifications/?user_id=1
# Résultat: "Vous êtes convoqué(e) à un entretien pour..."

# 4. Étudiant consulte son dashboard
GET /api/offers/student/applications/?student_id=1
# Résultat: Liste de toutes ses candidatures avec stats
```

---

## 📊 Nouvelles Tables

```sql
-- Table 1: Notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('APPLICATION_STATUS', 'NEW_OFFER', 'SYSTEM'),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Vues d'Offres (Statistiques)
CREATE TABLE offer_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id INT NOT NULL,
    student_id INT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ Checklist de Validation

- [ ] MySQL est démarré (`docker-compose up -d`)
- [ ] Migration exécutée (`python add_missing_features.py`)
- [ ] Serveur lancé (`python manage.py runserver`)
- [ ] Test notifications (créer candidature → changer statut → vérifier notification)
- [ ] Test dashboard étudiant (voir ses candidatures)
- [ ] Test modification d'offre
- [ ] Test archivage d'offre
- [ ] Test ciblage d'offres
- [ ] Test statistiques
- [ ] Test recherche de profils

---

## 🎯 MVP Status: 100% ✅

Toutes les fonctionnalités critiques sont implémentées et prêtes à être testées !
