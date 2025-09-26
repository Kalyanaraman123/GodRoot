# api/index.py
import os
import sys

# Ensure the project root is on sys.path so Django can import "store"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "store.settings")

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()  # Vercel looks for `app`
