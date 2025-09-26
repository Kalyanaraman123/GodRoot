import os
from django.core.wsgi import get_wsgi_application

# Point to your Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "store.settings")
app = get_wsgi_application()
