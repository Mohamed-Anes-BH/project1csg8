# 🧪 Guide de Test Manuel - Nouvelles Fonctionnalités

## Prérequis
1. Serveur Django lancé: `python manage.py runserver`
2. MySQL démarré: `docker-compose up -d`
3. Postman ou Insomnia installé

---

## Test 1: Système de Notifications ⭐

### Étape 1: Créer une candidature
```http
POST http://localhost:8000/api/offers/1/apply/
Content-Type: application/json

{
  "student_id": 1
}
```

### Étape 2: Changer le statut (en tant qu'entreprise)
```http
PUT http://localhost:8000/api/offers/applications/1/status/
Content-Type: application/json

{
  "status": "ENTRETIEN"
}
```

### Étape 3: Vérifier la notification créée
```http
GET http://localhost:8000/api/core/notifications/?user_id=1
```

**Résultat attendu:**
```json
{
  "notifications": [
    {
      "id": 1,
      "message": "Vous êtes convoqué(e) à un entretien pour l'offre \"...\" chez ...",
      "notification_type": "APPLICATION_STATUS",
      "is_read": false,
      "created_at": "2025-12-26T14:00:00"
    }
  ],
  "unread_count": 1
}
```

### Étape 4: Marquer comme lue
```http
POST http://localhost:8000/api/core/notifications/1/mark-read/
```

---

## Test 2: Dashboard Étudiant ⭐

```http
GET http://localhost:8000/api/offers/student/applications/?student_id=1
```

**Résultat attendu:**
```json
{
  "applications": [
    {
      "id": 1,
      "status": "ENTRETIEN",
      "applied_at": "2025-12-26T13:00:00",
      "updated_at": "2025-12-26T14:00:00",
      "offer_id": 1,
      "title": "Stage Développeur",
      "company_name": "TechCorp",
      "location": "Alger"
    }
  ],
  "stats": {
    "total": 1,
    "en_cours": 1,
    "acceptees": 0,
    "refusees": 0
  }
}
```

---

## Test 3: Modification d'Offre ⭐

```http
PUT http://localhost:8000/api/offers/1/update/
Content-Type: application/json

{
  "title": "Stage Développeur Full Stack - MODIFIÉ",
  "description": "Nouvelle description",
  "offer_type": "STAGE",
  "duration": "6 mois",
  "location": "Alger - Hydra",
  "is_targeted": false,
  "specialty_ids": [1, 2]
}
```

**Résultat attendu:**
```json
{
  "success": true,
  "message": "Offer updated successfully"
}
```

---

## Test 4: Archiver une Offre ⭐

```http
POST http://localhost:8000/api/offers/1/archive/
```

**Vérification:** L'offre ne doit plus apparaître dans:
```http
GET http://localhost:8000/api/offers/
```

---

## Test 5: Statistiques d'Offre ⭐

```http
GET http://localhost:8000/api/offers/1/statistics/
```

**Résultat attendu:**
```json
{
  "views": 0,
  "total_applications": 1,
  "applications_by_status": [
    {"status": "ENTRETIEN", "count": 1}
  ],
  "acceptance_rate": 0
}
```

---

## Test 6: Recherche de Profils ⭐

### Étape 1: Mettre un profil en PUBLIC
```http
PUT http://localhost:8000/api/auth/student/profile/
Content-Type: application/json

{
  "user_id": 1,
  "first_name": "Ahmed",
  "last_name": "Benali",
  "skills": "Python, Django, React",
  "experience": "Stage chez XYZ",
  "education": "Master Informatique",
  "cv_visibility": "PUBLIC"
}
```

### Étape 2: Rechercher
```http
GET http://localhost:8000/api/auth/students/search/?keyword=Python
```

**Résultat attendu:**
```json
{
  "students": [
    {
      "id": 1,
      "first_name": "Ahmed",
      "last_name": "Benali",
      "skills": "Python, Django, React",
      "university_name": "USTHB",
      "specialty_name": "Génie Logiciel"
    }
  ],
  "count": 1
}
```

---

## Test 7: Filtrage des Offres Ciblées ⭐

### Créer une offre ciblée pour USTHB
```http
POST http://localhost:8000/api/offers/create/
Content-Type: application/json

{
  "company_id": 1,
  "title": "Offre Ciblée USTHB",
  "description": "Réservée aux étudiants USTHB",
  "offer_type": "PFE",
  "duration": "6 mois",
  "location": "Alger",
  "is_targeted": true,
  "specialty_ids": [1],
  "university_ids": [1]
}
```

### Vérifier le filtrage
```http
# Étudiant de USTHB (university_id=1) voit l'offre
GET http://localhost:8000/api/offers/?student_id=1

# Étudiant d'une autre université ne la voit pas
GET http://localhost:8000/api/offers/?student_id=2
```

---

## Test 8: Marquer Toutes les Notifications comme Lues ⭐

```http
POST http://localhost:8000/api/core/notifications/mark-all-read/
Content-Type: application/json

{
  "user_id": 1
}
```

---

## ✅ Checklist de Validation

- [ ] Notifications créées automatiquement lors du changement de statut
- [ ] Dashboard étudiant affiche toutes les candidatures avec stats
- [ ] Modification d'offre fonctionne
- [ ] Archivage d'offre fonctionne
- [ ] Statistiques affichent vues et candidatures
- [ ] Recherche de profils fonctionne (PUBLIC seulement)
- [ ] Filtrage des offres ciblées fonctionne
- [ ] Marquer notifications comme lues fonctionne

---

## 🎯 Scénario Complet de Bout en Bout

1. **Étudiant** s'inscrit et complète son profil
2. **Entreprise** crée une offre ciblée
3. **Étudiant** voit l'offre (si son université est ciblée)
4. **Étudiant** postule
5. **Entreprise** change le statut → **Notification créée automatiquement**
6. **Étudiant** voit la notification dans son dashboard
7. **Étudiant** consulte son dashboard pour voir toutes ses candidatures
8. **Entreprise** consulte les statistiques de l'offre
9. **Entreprise** recherche des profils d'étudiants
10. **Entreprise** modifie ou archive l'offre

---

## 📝 Notes

- Tous les endpoints nécessitent normalement une authentification JWT
- Pour les tests, vous pouvez utiliser des IDs en dur (1, 2, etc.)
- En production, les IDs viendront du token JWT
