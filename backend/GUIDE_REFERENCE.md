# 📁 GUIDE DE RÉFÉRENCE - OÙ TROUVER CHAQUE FONCTIONNALITÉ

## 🔐 AUTHENTIFICATION & SÉCURITÉ

### `accounts/views.py`
- **RegisterStudentView** (ligne 11-48) - Inscription étudiant
- **RegisterCompanyView** (ligne 51-89) - Inscription entreprise
- **LoginView** (ligne 92-123) - Connexion JWT
- **VerifyEmailView** (ligne 126-156) - Vérification email
- **ResendVerificationView** (ligne 159-178) - Renvoyer email
- **ForgotPasswordView** (ligne 181-203) - Demande reset password
- **ResetPasswordView** (ligne 206-229) - Reset password
- **LogoutView** (ligne 232-240) - Déconnexion
- **ToggleEmailAlertsView** (ligne 243-257) - Alertes email
- **CurrentUserView** (ligne 260-272) - Info utilisateur
- **ChangePasswordView** (ligne 275-300) - Changer password

### `core/auth.py`
- **generate_jwt** (ligne 8-19) - Génération JWT
- **decode_jwt** (ligne 21-31) - Décodage JWT
- **JWTAuthentication** (ligne 33-79) - Classe auth DRF

### `core/security.py`
- **hash_password** - Hashage bcrypt
- **check_password** - Vérification password
- **generate_token** - Génération tokens

---

## 👤 ÉTUDIANT

### `students/views.py`

#### Profil
- **StudentProfileView** (ligne 84-123)
  - GET: Voir profil complet
  - PUT: Modifier profil
- **PublicStudentProfileView** (ligne 126-141)
  - GET: Voir profil public (avec compteur vues)
- **ToggleVisibilityView** (ligne 175-198)
  - PATCH: Basculer public/privé
  - GET: Voir statut visibilité
- **StudentSettingsView** (ligne 269-299)
  - GET: Voir paramètres
  - PATCH: Modifier paramètres

#### CV & Fichiers
- **UploadCVView** (ligne 201-234)
  - POST: Upload CV PDF
  - DELETE: Supprimer CV

#### Dashboard
- **StudentDashboardView** (ligne 24-81)
  - GET: Stats complètes + recommandations

#### Favoris
- **SavedOffersView** (ligne 237-266)
  - GET: Liste offres sauvegardées
  - POST: Sauvegarder offre
  - DELETE: Retirer favoris

#### Recommandations
- **RecommendationsView** (ligne 144-172)
  - GET: Offres recommandées basées sur skills

### Fonctions utilitaires
- **calculate_completeness** (ligne 10-21) - Calcul % complétion

---

## 🏢 ENTREPRISE

### `companies/views.py`

#### Profil
- **CompanyProfileView** (ligne 65-100)
  - GET: Voir profil
  - PUT: Modifier profil
- **PublicCompanyProfileView** (ligne 103-118)
  - GET: Profil public + offres actives
- **CompanySettingsView** (ligne 243-268)
  - GET: Voir paramètres
  - PATCH: Modifier paramètres

#### Logo
- **UploadLogoView** (ligne 121-156)
  - POST: Upload logo
  - DELETE: Supprimer logo

#### Dashboard
- **CompanyDashboardView** (ligne 25-62)
  - GET: Stats complètes entreprise

#### Offres
- **CompanyOffersView** (ligne 159-178)
  - GET: Liste offres avec stats (filtres: draft/published)

#### Candidatures
- **CompanyApplicationsView** (ligne 181-213)
  - GET: Liste candidatures (filtres: status, offer_id)
- **DownloadStudentCVView** (ligne 216-240)
  - GET: Télécharger CV étudiant

### Fonctions utilitaires
- **calculate_company_completeness** (ligne 11-22) - Calcul % complétion

---

## 📄 OFFRES

### `offers/views.py`

#### Liste & Recherche
- **OfferListView** (ligne 12-103)
  - GET: Liste + recherche + filtres + pagination
  - POST: Créer offre (draft ou publié)

#### Détail & Modification
- **OfferDetailView** (ligne 106-157)
  - GET: Détail offre (incrémente vues)
  - PUT: Modifier offre

#### Gestion statuts
- **PublishOfferView** (ligne 160-177)
  - PATCH: Publier offre (DRAFT → OPEN)
- **ArchiveOfferView** (ligne 180-197)
  - PATCH: Archiver offre
- **CloseOfferView** (ligne 200-218)
  - PATCH: Clôturer offre
- **DeleteOfferView** (ligne 221-238)
  - DELETE: Suppression logique

#### Import & Duplication
- **ImportOffersView** (ligne 241-275)
  - POST: Import Excel (.xlsx)
- **DuplicateOfferView** (ligne 278-315)
  - POST: Dupliquer offre

---

## 📬 CANDIDATURES

### `applications/views.py`

#### Liste
- **ApplicationListView** (ligne 12-46)
  - GET: Liste candidatures (étudiant: ses candidatures, entreprise: reçues)
  - Filtres: status, pagination

#### Actions étudiant
- **ApplyView** (ligne 49-88)
  - POST: Postuler à offre
- **WithdrawApplicationView** (ligne 91-113)
  - DELETE: Retirer candidature (si PENDING)

#### Actions entreprise
- **UpdateApplicationStatusView** (ligne 116-181)
  - PATCH: Changer statut + note interne
  - Notifications auto + email

#### Détail & Stats
- **ApplicationDetailView** (ligne 184-219)
  - GET: Détail candidature (vue différente étudiant/entreprise)
- **ApplicationStatsView** (ligne 222-258)
  - GET: Stats candidatures par statut

---

## 🔔 NOTIFICATIONS

### `notifications/views.py`

- **NotificationListView** (ligne 9-36)
  - GET: Liste notifications (filtre: unread_only)
- **MarkReadView** (ligne 39-53)
  - PATCH: Marquer comme lu (une ou toutes)
- **DeleteNotificationView** (ligne 56-76)
  - DELETE: Supprimer notification(s)
- **NotificationStatsView** (ligne 79-101)
  - GET: Compteur non lues + récentes
- **NotificationPreferencesView** (ligne 104-125)
  - GET/PATCH: Préférences email

---

## 💬 MESSAGERIE

### `messaging/views.py`

- **ConversationListView** - Liste conversations
- **MessageListView** - Liste messages d'une conversation
- **SendMessageView** - Envoyer message
- Création auto conversation si inexistante

---

## 🧩 ADMIN

### `admin_panel/views.py`

#### Statistiques
- **AdminStatsView** (ligne 11-35)
  - GET: Stats globales plateforme

#### Utilisateurs
- **AdminUserListView** (ligne 38-76)
  - GET: Liste utilisateurs (filtres: role, verified, search)
- **AdminUserDetailView** (ligne 79-109)
  - GET: Détail utilisateur + profil
- **AdminToggleUserView** (ligne 112-131)
  - PATCH: Activer/désactiver compte
- **AdminSuspendUserView** (ligne 134-154)
  - PATCH: Suspendre utilisateur

#### Offres
- **AdminOfferListView** (ligne 157-185)
  - GET: Liste toutes offres (filtre: status)
- **AdminOfferDetailView** (ligne 188-206)
  - GET: Détail offre + stats
- **AdminDeleteOfferView** (ligne 209-233)
  - DELETE: Supprimer offre (modération)

#### Système
- **AdminLogsView** (ligne 236-254)
  - GET: Logs métier
- **AdminSendNotificationView** (ligne 257-297)
  - POST: Envoyer notification (un user ou tous)
- **AdminIncompleteProfilesView** (ligne 300-315)
  - GET: Profils incomplets

---

## 🛠️ CORE UTILITIES

### `core/email.py`

- **send_email** (ligne 7-28) - Envoi SMTP générique
- **send_verification_email** (ligne 31-50) - Email vérification
- **send_password_reset_email** (ligne 53-72) - Email reset password
- **send_notification_email** (ligne 75-89) - Email notification
- **send_application_notification** (ligne 92-107) - Email nouvelle candidature
- **send_status_update_email** (ligne 110-134) - Email changement statut
- **send_new_offer_notification** (ligne 137-153) - Email nouvelle offre
- **send_profile_reminder_email** (ligne 156-190) - Email rappel profil

### `core/notifications.py`

- **create_notification** - Créer notification in-app

### `core/logs.py`

- **log_action** - Logger action métier
- **get_logs** - Récupérer logs

### `core/excel.py`

- **parse_excel_file** - Parser fichier Excel
- **validate_excel_columns** - Valider colonnes
- **insert_offers_from_excel** - Insérer offres

### `core/utils.py`

- **paginate_results** - Pagination

### `core/db.py`

- **execute_query** - Exécuter requête SQL
- **queries** - Dictionnaire requêtes nommées

---

## 🗄️ SQL QUERIES

### `sql/query.sql`

Contient toutes les requêtes SQL nommées utilisées dans l'application:

- Authentification (register, login, verify, reset password)
- Profils (student, company)
- Offres (CRUD, filtres, stats)
- Candidatures (CRUD, filtres, stats)
- Notifications (CRUD, stats)
- Messagerie (conversations, messages)
- Admin (stats, modération)
- Dashboard (stats complètes)

---

## 📋 COMMANDES DJANGO

### `offers/management/commands/expire_offers.py`

- **expire_offers** - Commande pour expirer automatiquement les offres
- Usage: `python manage.py expire_offers`

---

## 🔑 PERMISSIONS

### `accounts/permissions.py`

- **IsAdmin** - Permission admin
- **IsStudent** - Permission étudiant
- **IsCompany** - Permission entreprise

---

## 🎯 RÉSUMÉ PAR MODULE

| Module | Fichiers | Endpoints | Fonctionnalités |
|--------|----------|-----------|-----------------|
| **accounts** | views.py, permissions.py | 11 | Auth complète |
| **students** | views.py | 9 | Profils étudiants |
| **companies** | views.py | 8 | Profils entreprises |
| **offers** | views.py | 9 | Gestion offres |
| **applications** | views.py | 6 | Candidatures |
| **messaging** | views.py | 3+ | Messagerie |
| **notifications** | views.py | 5 | Notifications |
| **admin_panel** | views.py | 10 | Administration |
| **core** | 8 fichiers | - | Utilitaires |

---

**Total: 60+ endpoints REST API**  
**100% des fonctionnalités implémentées** ✅
