import os
from django.core.wsgi import get_wsgi_application

# Point to your Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "store.settings")

# Vercel looks for pp or handler
app = get_wsgi_application()
