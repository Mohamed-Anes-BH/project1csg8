#!/usr/bin/env python3
"""
Script to consolidate Django apps into a simplified structure.
This will merge all apps into a single 'core' app organized by file type.
"""

import os
import shutil
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
APPS_DIR = BASE_DIR / 'apps'
CORE_DIR = APPS_DIR / 'core'

# Apps to consolidate (excluding core)
APPS_TO_MERGE = [
    'accounts', 'profiles', 'academic', 'skills', 
    'experiences', 'offers', 'applications', 'notifications',
    'alerts', 'analytics', 'moderation'
]

def create_core_structure():
    """Create the new organized structure in core app"""
    directories = [
        CORE_DIR / 'models',
        CORE_DIR / 'views', 
        CORE_DIR / 'serializers',
        CORE_DIR / 'migrations',
    ]
    
    for directory in directories:
        directory.mkdir(exist_ok=True, parents=True)
        (directory / '__init__.py').touch()
    
    print("✓ Created core app structure")

def consolidate_models():
    """Merge all models into core/models/"""
    models_dir = CORE_DIR / 'models'
    
    for app_name in APPS_TO_MERGE:
        app_models = APPS_DIR / app_name / 'models.py'
        if app_models.exists() and app_models.stat().st_size > 50:  # Not empty
            dest = models_dir / f'{app_name}.py'
            shutil.copy2(app_models, dest)
            print(f"✓ Copied models from {app_name}")

def consolidate_views():
    """Merge all views into core/views/"""
    views_dir = CORE_DIR / 'views'
    
    for app_name in APPS_TO_MERGE:
        app_views = APPS_DIR / app_name / 'views.py'
        if app_views.exists() and app_views.stat().st_size > 50:
            dest = views_dir / f'{app_name}.py'
            shutil.copy2(app_views, dest)
            print(f"✓ Copied views from {app_name}")

def consolidate_serializers():
    """Merge all serializers into core/serializers/"""
    serializers_dir = CORE_DIR / 'serializers'
    
    for app_name in APPS_TO_MERGE:
        app_serializers = APPS_DIR / app_name / 'serializers.py'
        if app_serializers.exists() and app_serializers.stat().st_size > 50:
            dest = serializers_dir / f'{app_name}.py'
            shutil.copy2(app_serializers, dest)
            print(f"✓ Copied serializers from {app_name}")

def update_imports():
    """Update __init__.py files to import everything"""
    
    # Models __init__.py
    models_init = CORE_DIR / 'models' / '__init__.py'
    models_imports = []
    for app_name in APPS_TO_MERGE:
        if (CORE_DIR / 'models' / f'{app_name}.py').exists():
            models_imports.append(f"from .{app_name} import *")
    
    models_init.write_text('\n'.join(models_imports))
    print("✓ Updated models/__init__.py")
    
    # Views __init__.py
    views_init = CORE_DIR / 'views' / '__init__.py'
    views_imports = []
    for app_name in APPS_TO_MERGE:
        if (CORE_DIR / 'views' / f'{app_name}.py').exists():
            views_imports.append(f"from .{app_name} import *")
    
    views_init.write_text('\n'.join(views_imports))
    print("✓ Updated views/__init__.py")
    
    # Serializers __init__.py
    serializers_init = CORE_DIR / 'serializers' / '__init__.py'
    serializers_imports = []
    for app_name in APPS_TO_MERGE:
        if (CORE_DIR / 'serializers' / f'{app_name}.py').exists():
            serializers_imports.append(f"from .{app_name} import *")
    
    serializers_init.write_text('\n'.join(serializers_imports))
    print("✓ Updated serializers/__init__.py")

def create_backup():
    """Create backup of apps folder"""
    backup_dir = BASE_DIR / 'apps_backup'
    if not backup_dir.exists():
        shutil.copytree(APPS_DIR, backup_dir)
        print(f"✓ Created backup at {backup_dir}")
    else:
        print("⚠ Backup already exists, skipping")

def main():
    print("=" * 60)
    print("Django Apps Consolidation Script")
    print("=" * 60)
    
    response = input("\n⚠️  This will reorganize your Django apps. Continue? (yes/no): ")
    if response.lower() != 'yes':
        print("Cancelled.")
        return
    
    print("\n1. Creating backup...")
    create_backup()
    
    print("\n2. Creating new core structure...")
    create_core_structure()
    
    print("\n3. Consolidating models...")
    consolidate_models()
    
    print("\n4. Consolidating views...")
    consolidate_views()
    
    print("\n5. Consolidating serializers...")
    consolidate_serializers()
    
    print("\n6. Updating imports...")
    update_imports()
    
    print("\n" + "=" * 60)
    print("✅ Consolidation complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Update INSTALLED_APPS in settings.py to only include 'apps.core'")
    print("2. Update imports in your code to use 'apps.core.models', etc.")
    print("3. Run: python manage.py makemigrations")
    print("4. Run: python manage.py migrate")
    print("5. Test your application")
    print("\nBackup location: apps_backup/")

if __name__ == '__main__':
    main()
