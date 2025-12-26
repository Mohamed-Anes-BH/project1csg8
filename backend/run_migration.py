import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dzstagiaire.settings')
django.setup()

from accounts.db_utils import execute_script

print("Running migration: Add email verification support...")
success = execute_script('accounts/sql/migration_add_email_verification.sql')

if success:
    print("✅ Migration completed successfully!")
else:
    print("❌ Migration failed!")
    sys.exit(1)
