# Project1CS Backend

Django REST API backend for student-company matching platform.

## Features

- 🔐 JWT Authentication (Students & Companies)
- 👤 User Profiles (Student & Company)
- 🎓 Academic System (Domains, Specialties, Universities)
- 💼 Offers Management (Stages, PFE, Emploi)
- 📨 Applications Workflow
- 🔔 Notifications System
- 🚨 Alerts & Saved Searches
- 📊 Analytics & Statistics
- 🛡️ Moderation System

## Quick Start

### Development

1. **Setup Environment**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements/dev.txt
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Run Migrations**
```bash
python manage.py migrate
python manage.py createsuperuser
```

4. **Run Server**
```bash
python manage.py runserver
```

### With Docker

```bash
docker-compose up -d
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
```

## Project Structure

```
backend/
├── apps/               # All Django apps
│   ├── accounts/       # Authentication
│   ├── profiles/       # User profiles
│   ├── academic/       # Academic data
│   ├── skills/         # Skills management
│   ├── experiences/    # Work/education history
│   ├── offers/         # Job offers
│   ├── applications/   # Applications workflow
│   ├── notifications/  # Notifications
│   ├── alerts/         # Search alerts
│   ├── analytics/      # Statistics
│   ├── moderation/     # Admin moderation
│   └── core/           # Shared utilities
├── config/             # Django settings
├── media/              # Uploaded files
├── static/             # Static files
├── docs/               # Documentation
├── tests/              # Global tests
└── requirements/       # Dependencies
```

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

## Testing

```bash
pytest
pytest --cov=apps
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions.

## Technology Stack

- Django 5.2.8
- Django REST Framework 3.16.1
- PostgreSQL (production)
- Redis (caching & Celery)
- Celery (async tasks)
- JWT Authentication

## License

MIT
