"""
WSGI config for airbnb_clone project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'airbnb_clone.settings')

application = get_wsgi_application()

