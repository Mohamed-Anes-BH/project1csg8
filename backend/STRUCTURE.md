# Simplified Django Project Structure

## Current Structure (Complex)
```
backend/
├── apps/              # 13 separate app folders
│   ├── accounts/
│   ├── profiles/
│   ├── academic/
│   ├── skills/
│   ├── experiences/
│   ├── offers/
│   ├── applications/
│   ├── notifications/
│   ├── alerts/
│   ├── analytics/
│   ├── moderation/
│   └── core/
├── config/
├── requirements/
└── other files...
```

## Recommended Simplified Structure
```
backend/
├── core/              # Main application logic (consolidate everything here)
│   ├── models/       # All models in one place
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── offer.py
│   │   ├── application.py
│   │   └── notification.py
│   ├── views/        # All views organized by feature
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── offers.py
│   │   ├── profiles.py
│   │   └── applications.py
│   ├── serializers/  # All serializers
│   ├── urls.py
│   └── admin.py
├── config/           # Django settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── static/          # Static files
├── media/           # User uploads
├── requirements.txt # Single requirements file
├── manage.py
└── README.md
```

## Benefits of Simplified Structure:
1. ✅ **Easier to find code** - Everything in one app
2. ✅ **Less boilerplate** - No duplicate files across 13 apps
3. ✅ **Faster development** - Less switching between folders
4. ✅ **Better for small/medium projects** - Easier to understand
5. ✅ **Still organized** - Files grouped by type (models, views, serializers)

## Migration Steps:
Run the provided script to consolidate:
```bash
python scripts/consolidate_apps.py
```

This will:
- Merge all models into core/models/
- Merge all views into core/views/
- Merge all serializers into core/serializers/
- Update imports automatically
- Keep your database intact
