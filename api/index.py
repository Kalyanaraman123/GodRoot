import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "store.settings")
app = get_wsgi_application()  # Vercel looks for `app`
