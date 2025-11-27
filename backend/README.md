# Django REST API

A Django REST API project with Django REST Framework.

## Setup

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Create superuser (optional):
```bash
python manage.py createsuperuser
```

5. Run development server:
```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`

## Features

- Django 5.2.8
- Django REST Framework 3.16.1
- CORS headers configured for frontend at localhost:3000
- SQLite database (default)

## Project Structure

```
backend/
├── config/          # Project settings
├── manage.py        # Django management script
├── venv/            # Virtual environment
└── requirements.txt # Python dependencies
```
