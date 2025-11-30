# Deployment Guide

## Prerequisites
- Python 3.10+
- PostgreSQL 15+
- Redis (for Celery)
- Nginx (for production)

## Development Setup

1. **Clone Repository**
```bash
git clone <repo-url>
cd backend
```

2. **Create Virtual Environment**
```bash
python3 -m venv venv
source venv/bin/activate
```

3. **Install Dependencies**
```bash
pip install -r requirements/dev.txt
```

4. **Environment Variables**
```bash
cp .env.example .env
# Edit .env with your settings
```

5. **Database Setup**
```bash
python manage.py migrate
python manage.py createsuperuser
```

6. **Run Server**
```bash
python manage.py runserver
```

## Production Deployment (Docker)

1. **Build and Run**
```bash
docker-compose up -d
```

2. **Run Migrations**
```bash
docker-compose exec web python manage.py migrate
```

3. **Create Superuser**
```bash
docker-compose exec web python manage.py createsuperuser
```

4. **Collect Static Files**
```bash
docker-compose exec web python manage.py collectstatic --noinput
```

## Production Deployment (Manual)

1. **Install Dependencies**
```bash
pip install -r requirements/prod.txt
```

2. **Configure Settings**
- Set `DEBUG=False`
- Configure `ALLOWED_HOSTS`
- Set strong `SECRET_KEY`
- Configure database URL

3. **Collect Static Files**
```bash
python manage.py collectstatic --noinput
```

4. **Run with Gunicorn**
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

5. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /static/ {
        alias /path/to/staticfiles/;
    }

    location /media/ {
        alias /path/to/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Celery Setup

1. **Start Worker**
```bash
celery -A config worker -l info
```

2. **Start Beat Scheduler**
```bash
celery -A config beat -l info
```

## Monitoring

- Use Sentry for error tracking
- Configure logging in settings
- Monitor Celery tasks
- Set up database backups

## Security Checklist

- [ ] DEBUG=False in production
- [ ] Strong SECRET_KEY
- [ ] HTTPS enabled
- [ ] Database password secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Regular security updates
