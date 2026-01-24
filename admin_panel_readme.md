# DZ-Stagiaire Admin Panel

Welcome to the DZ-Stagiaire Admin Panel. This documentation provides an overview of the admin features, architecture, and usage.

## 🚀 Overview

The Admin Panel is a comprehensive dashboard designed for platform administrators to manage users, moderate offers, view statistics, and configure system settings. It is built with React (Frontend) and Django/MySQL (Backend).

## 🔑 Access

**URL:** `/admin`  (Redirects to login if not authenticated)

**Default Credentails:**
- **Email:** `admin@dz-stagiaire.dz`
- **Password:** `admin123`

> **Note:** Access is restricted to users with the `ADMIN` role only.

## 🛠 Features

### 1. 📊 Dashboard (`/admin`)
- **Real-time Stats:** Total students, companies, active offers, and new applications (24h).
- **Growth Charts:** Visual representation of user and offer growth over the last 6 months.
- **Recent Activity:** Feed of latest actions (new registrations, new offers, verifications).
- **Recent Applications:** Quick view of the latest student applications.

### 2. 👥 User Management (`/admin/users`)
- **User List:** View all registered students and companies with advanced filtering (Role, Verification Status).
- **Profile Details:** View detailed profiles (CVs, descriptions, skills).
- **Moderation:**
  - **Suspend/Restore Users:** Block access for violating terms.
  - **Verify Users:** Manually verify accounts.
  - **Create Users:** Manually add new students or companies.

### 3. 💼 Offer Moderation (`/admin/offers`)
- **Workflow:** Offers pass through a moderation queue: `Pending` -> `Approved` (Published) or `Rejected`.
- **Bulk Actions:** Approve multiple offers at once.
- **Filtering:** Filter by status (Pending, Published, Reported, Archived).
- **Details:** View full offer details including company info.

### 4. ⚙️ System Settings (`/admin/settings`)
- **Dynamic Configuration:** Change system parameters without code deployment.
- **Categories:**
  - **General:** Site name, maintenance mode.
  - **Security:** Email verification requirements.
  - **Notifications:** Toggle admin alerts.
- **Quick Actions:** Clear cache, export data.

## 🏗 Architecture

### Frontend
- **Layout:** Dedicated `AdminLayout` with sidebar navigation.
- **Components:** Reusable admin components (StatsCard, Tables, Modals).
- **Routes:** Protected by `PrivateRoute` with `role="ADMIN"`.
- **Service:** `adminService.js` handles all API communication.

### Backend
- **App:** `admin_panel` Django app.
- **Views:** specialized `APIViews` for admin logic.
- **Database:**
  - `admin_settings`: Key-value store for system config.
  - `activity_logs`: Audit trail for admin actions.
  - `reports`: Content reporting system.
  - `monthly_stats`: Aggregated data for fast charting.
- **Security:** All endpoints protected by `IsAdmin` permission.

## 🔧 Setup & Installation

To initialize the admin panel tables and default user, run the following command from the project root:

```bash
# Initialize Admin DB
python3 backend/dz_stagiaire_backend/init_admin.py
```

*Note: Ensure your database credentials in `.env` are correct before running.*

## 📝 SQL Schema

New tables added:
- `admin_settings`
- `activity_logs`
- `reports`
- `monthly_stats`

Existing tables modified:
- `offers`: Added `is_approved`, `approved_by`, `approved_at`.

---
*Built for DZ-Stagiaire Platform*
