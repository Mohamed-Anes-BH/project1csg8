# 📋 DZ-Stagiaire - Integration Documentation

## 🔗 Overview

This document details the complete integration between the **Frontend (React/Vite)** and **Backend (Django REST Framework)** for the DZ-Stagiaire platform. The integration connects all frontend pages to their corresponding backend API endpoints, enabling a fully functional internship/job matching platform.

---

## 📊 Integration Status Summary

| Page | Status | Description |
|------|--------|-------------|
| **Authentication** | ✅ Complete | Login, Register, Logout, Email Verification |
| **Student Dashboard** | ✅ Complete | Real statistics, applications, saved offers |
| **Company Dashboard** | ✅ Complete | Real stats, applications overview, Excel import |
| **Offers List** | ✅ Complete | Dynamic offers with pagination & filters |
| **Offer Details** | ✅ Complete | Real offer data with apply button |
| **Create Offer** | ✅ Complete | Form submission to backend |
| **Manage Offers** | ✅ Complete | CRUD operations, status changes |
| **Candidates List** | ✅ Complete | Real applications, status management |
| **Messaging** | ✅ Complete | Real-time conversations & messages |
| **Student Profile** | ✅ Complete | Edit profile, CV upload, visibility toggle |
| **Company Profile** | ✅ Complete | Company info display with offers |
| **Settings** | ✅ Complete | Password change, email alerts toggle |
| **Notifications** | ✅ Complete | Real-time notifications in Navbar |

---

## 🔧 Files Modified

### Frontend Services (`/frontend/src/services/`)

| Service | Purpose | Endpoints Used |
|---------|---------|----------------|
| `api.js` | Base Axios instance with JWT interceptors | All |
| `authService.js` | Authentication operations | `/api/auth/*` |
| `applicationService.js` | Application/candidature management | `/api/applications/*` |
| `offerService.js` | Offer CRUD operations | `/api/offers/*` |
| `profileService.js` | Student & Company profile operations | `/api/students/*`, `/api/companies/*` |
| `messageService.js` | Messaging & Notifications | `/api/messaging/*`, `/api/notifications/*` |

### Frontend Pages (`/frontend/src/pages/`)

#### 1. `tablebordEtudient.jsx` (Student Dashboard)

**Integration Details:**
- Fetches dashboard stats from `GET /api/students/dashboard/`
- Loads recent applications from `GET /api/applications/`
- Fetches saved offers from `GET /api/students/saved-offers/`
- Displays recommendations from `GET /api/students/recommendations/`

**Data Mapping:**
```javascript
dashboardData = {
    applications_count,    // Total applications
    saved_offers_count,    // Bookmarked offers
    profile_views,         // Profile views
    profile_completeness,  // Completion percentage
    recent_notifications,  // Latest notifications
    recommendations        // AI-powered offer suggestions
}
```

---

#### 2. `bordenterprise.jsx` (Company Dashboard)

**Integration Details:**
- Fetches stats from `GET /api/companies/dashboard/`
- Loads recent applications from `GET /api/companies/applications/`
- Excel import via `POST /api/offers/import/`

**Features:**
- Real-time statistics (active offers, total applications, views)
- Filter applications by status
- Excel import for bulk offer creation

---

#### 3. `listecondidateurs.jsx` (Candidates Management)

**Integration Details:**
- Fetches candidates from `GET /api/companies/applications/`
- Updates status via `PATCH /api/applications/{id}/`
- Downloads CV via `GET /api/companies/download-cv/{student_id}/`

**Features:**
- Filter by status (pending, preselected, accepted, rejected)
- Search by name or degree
- Accept/Reject/Preselect actions
- CV download functionality
- Internal notes support

**API Mapping:**
```javascript
// Status values (Backend ↔ Frontend)
'PENDING'     ↔ 'pending'      // En attente
'PRESELECTED' ↔ 'preselected'  // Présélectionné
'ACCEPTED'    ↔ 'accepted'     // Acceptée
'REJECTED'    ↔ 'rejected'     // Refusée
```

---

#### 4. `gestiondesoffres.jsx` (Offers Management)

**Integration Details:**
- Fetches company offers from `GET /api/offers/`
- Publish draft: `PATCH /api/offers/{id}/publish/`
- Archive offer: `PATCH /api/offers/{id}/archive/`
- Delete offer: `DELETE /api/offers/{id}/`
- Duplicate offer: `POST /api/offers/{id}/duplicate/`

**Features:**
- Filter by status (all, active, draft, archived)
- Search by title
- Pagination support
- Quick actions (publish, edit, duplicate, archive, delete)

---

#### 5. `creationoffre.jsx` (Create Offer)

**Integration Details:**
- Submits new offer via `POST /api/offers/`

**Form Data Mapping:**
```javascript
payload = {
    title: formData.titre,
    description: formData.description,
    type: 'STAGE' | 'PFE' | 'EMPLOI',
    location: formData.lieu,
    duration: 'Du X au Y',
    skills: 'skill1, skill2, skill3',
    is_draft: false
}
```

---

#### 6. `messagerie.jsx` (Messaging)

**Integration Details:**
- Fetches conversations from `GET /api/messaging/conversations/`
- Fetches messages from `GET /api/messaging/conversations/{id}/messages/`
- Sends message via `POST /api/messaging/conversations/{id}/messages/`

**Features:**
- Real-time polling (every 10 seconds)
- Optimistic message sending
- Unread message indicators
- User presence indicators (planned)

---

#### 7. `detailleoffer.jsx` (Offer Details)

**Integration Details:**
- Fetches offer from `GET /api/offers/{id}/`
- Apply to offer via `POST /api/applications/apply/`

**Features:**
- "Postuler en 1 clic" button
- Prevents duplicate applications
- Company profile link

---

#### 8. `profileEtudient.jsx` (Student Profile)

**Integration Details:**
- Fetches profile from `GET /api/students/profile/`
- Updates profile via `PUT /api/students/profile/`
- Toggle visibility via `PATCH /api/students/visibility/`
- Upload CV via `POST /api/students/upload-cv/`
- Toggle email alerts via `PATCH /api/accounts/toggle-email-alerts/`

**Features:**
- Education management
- Skills management (comma-separated)
- Experience management
- Social links (LinkedIn, GitHub, Portfolio)
- CV upload/download
- Public/Private profile toggle

---

#### 9. `profileEntreprise.jsx` (Company Profile)

**Integration Details:**
- Fetches profile from `GET /api/companies/profile/`
- Fetches offers from `GET /api/offers/` (filtered by status)

**Features:**
- Company information display
- Active offers listing
- About section
- Key information sidebar

---

#### 10. `Settings.jsx` (User Settings)

**Integration Details:**
- Change password via `POST /api/auth/change-password/`
- Toggle email alerts via `PATCH /api/notifications/preferences/`
- Get preferences from `GET /api/notifications/preferences/`

**Features:**
- Security settings (password change)
- Notification preferences
- Account settings

---

#### 11. `navbar.jsx` (Navigation)

**Integration Details:**
- Fetches notification count from `GET /api/notifications/stats/`
- Fetches notifications from `GET /api/notifications/`
- Mark as read via `PATCH /api/notifications/{id}/read/`

**Features:**
- Real-time notification badge
- Dropdown with recent notifications
- Mark individual as read
- "Mark all as read" action

---

## 🔐 Authentication Flow

### Token Management
```javascript
// Token stored in localStorage
localStorage.setItem('token', response.access);
localStorage.setItem('user', JSON.stringify(userInfo));

// Axios interceptor automatically attaches token
config.headers.Authorization = `Bearer ${token}`;

// Auto-redirect on 401 (expired token)
if (error.response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/signin';
}
```

### Role-Based Access
- **STUDENT**: Student dashboard, profile, applications
- **COMPANY**: Company dashboard, offers management, candidates
- **Both**: Messaging, settings, notifications

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register/student/` | Register student |
| POST | `/register/company/` | Register company |
| POST | `/login/` | Login (returns JWT) |
| POST | `/logout/` | Logout |
| GET | `/me/` | Current user info |
| POST | `/change-password/` | Change password |
| POST | `/forgot-password/` | Request password reset |
| POST | `/reset-password/` | Reset with token |

### Students (`/api/students/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/` | Dashboard stats |
| GET/PUT | `/profile/` | Student profile |
| PATCH | `/visibility/` | Toggle public/private |
| POST/DELETE | `/upload-cv/` | CV management |
| GET | `/saved-offers/` | Bookmarked offers |
| GET | `/recommendations/` | Offer recommendations |

### Companies (`/api/companies/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/` | Dashboard stats |
| GET/PUT | `/profile/` | Company profile |
| POST/DELETE | `/upload-logo/` | Logo management |
| GET | `/applications/` | Received applications |
| GET | `/download-cv/{id}/` | Download student CV |

### Offers (`/api/offers/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List/search offers |
| POST | `/` | Create offer |
| GET/PUT | `/{id}/` | Get/update offer |
| PATCH | `/{id}/publish/` | Publish draft |
| PATCH | `/{id}/close/` | Close offer |
| PATCH | `/{id}/archive/` | Archive offer |
| DELETE | `/{id}/` | Delete offer |
| POST | `/{id}/duplicate/` | Duplicate offer |
| POST | `/import/` | Excel import |

### Applications (`/api/applications/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List applications |
| POST | `/apply/` | Apply to offer |
| PATCH | `/{id}/` | Update status |
| DELETE | `/{id}/` | Withdraw application |

### Messaging (`/api/messaging/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations/` | List conversations |
| GET | `/conversations/{id}/messages/` | Get messages |
| POST | `/conversations/{id}/messages/` | Send message |

### Notifications (`/api/notifications/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List notifications |
| GET | `/stats/` | Unread count |
| PATCH | `/{id}/read/` | Mark as read |
| PATCH | `/read/` | Mark all as read |
| GET/PATCH | `/preferences/` | Email preferences |

---

## 🚀 How to Run

### Backend
```bash
cd backend/dz_stagiaire_backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `/frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🎯 What Was Done

### New Integrations
1. **`listecondidateurs.jsx`** - Connected to real API
   - Fetches applications from backend
   - Status updates (accept/reject/preselect)
   - CV download functionality
   - Search and filter support
   - Query parameter support for filtering by offer

2. **`gestiondesoffres.jsx`** - Connected to real API
   - Fetches company's offers
   - Real-time status management
   - Publish, archive, delete, duplicate actions
   - Filter and search functionality
   - Pagination support

3. **Routes added:**
   - `/liste-candidatures` - Candidates list with offer filter support

### Already Integrated (Verified Working)
- Authentication (Login/Register/Logout)
- Student Dashboard
- Company Dashboard  
- Offers List & Details
- Create Offer
- Messaging
- Student Profile
- Company Profile
- Settings
- Notifications

---

## 📝 Notes for Developers

### Error Handling
All API calls use try/catch with optimistic updates and rollback on failure.

### Loading States
Every page that fetches data shows a spinner during loading.

### Real-time Updates
Messaging uses polling (10 seconds interval) for "real-time" updates.

### Status Mapping
Backend uses UPPERCASE status values, frontend uses lowercase.
Always convert when sending/receiving.

---

## 📄 License

Academic Project - PFE 2024
