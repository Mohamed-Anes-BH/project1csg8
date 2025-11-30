# API Documentation

## Base URL
`http://localhost:8000/api/v1/`

## Authentication
All protected endpoints require JWT authentication via Bearer token in header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication
- `POST /auth/register/` - Register new user
- `POST /auth/login/` - Login and get JWT tokens
- `POST /auth/logout/` - Logout
- `POST /auth/token/refresh/` - Refresh access token

### Profiles
- `GET /profiles/students/` - List student profiles
- `GET /profiles/students/{id}/` - Get student profile detail
- `PUT /profiles/students/{id}/` - Update student profile
- `GET /profiles/companies/` - List company profiles
- `GET /profiles/companies/{id}/` - Get company profile detail

### Academic
- `GET /academic/domains/` - List all domains
- `GET /academic/specialties/` - List specialties (filter by domain)
- `GET /academic/universities/` - List universities

### Offers
- `GET /offers/` - List offers (with filters)
- `POST /offers/` - Create offer (company only)
- `GET /offers/{id}/` - Get offer detail
- `PUT /offers/{id}/` - Update offer (owner only)
- `DELETE /offers/{id}/` - Delete offer (owner only)
- `GET /offers/my-offers/` - Get current company's offers

### Applications
- `POST /applications/apply/{offer_id}/` - Apply to offer
- `GET /applications/my-applications/` - Get student's applications
- `GET /applications/offer/{offer_id}/` - Get applications for offer (company only)
- `PUT /applications/{id}/status/` - Update application status (company only)

### Notifications
- `GET /notifications/` - List notifications
- `PUT /notifications/{id}/mark-read/` - Mark as read
- `GET /notifications/unread-count/` - Get unread count

## Request/Response Examples

### Register
```json
POST /auth/register/
{
  "email": "student@example.com",
  "password": "securepassword",
  "role": "student",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Create Offer
```json
POST /offers/
{
  "title": "Stage PFE en IA",
  "description": "...",
  "offer_type": "PFE",
  "duration": 6,
  "targeted_universities": [1, 2],
  "required_specialties": [3],
  "required_skills": [5, 8, 12],
  "expiration_date": "2025-12-31"
}
```

## Filters

### Offers
- `?type=PFE` - Filter by offer type
- `?specialty=3` - Filter by specialty
- `?location=Algiers` - Filter by location
- `?search=python` - Search in title/description
