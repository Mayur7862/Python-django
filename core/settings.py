# core/settings.py
from pathlib import Path
import os
from corsheaders.defaults import default_headers, default_methods

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Dev basics ---
SECRET_KEY = "dev-secret"
DEBUG = True                           # keep True for local dev
ALLOWED_HOSTS = ["*"]                  # allow everything in dev to avoid host issues
APPEND_SLASH = False
# --- Apps ---
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",            # CORS
    "graphene_django",        # GraphQL
    "projects",               # your app
]

# --- Middleware (CORS must be first) ---
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "projects.middleware.OrganizationFromHeaderMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# --- Database (Postgres via Docker compose) ---
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("PGDATABASE", "pmdb"),
        "USER": os.getenv("PGUSER", "pmuser"),
        "PASSWORD": os.getenv("PGPASSWORD", "pmpass"),
        "HOST": os.getenv("PGHOST", "127.0.0.1"),
        "PORT": os.getenv("PGPORT", "5432"),
    }
}

# --- Static ---
STATIC_URL = "static/"

# --- GraphQL ---
GRAPHENE = {"SCHEMA": "projects.schema.schema"}

# --- CORS/CSRF for React dev on :5173 ---
CORS_ALLOW_ALL_ORIGINS = True              # wide open for local dev
CORS_ALLOW_CREDENTIALS = False

# explicitly allow our custom header; wildcard can be flaky
CORS_ALLOW_HEADERS = list(default_headers) + [
    "x-org-slug",
    "content-type",
]
CORS_ALLOW_METHODS = list(default_methods) + ["OPTIONS"]

# trust vite origins (not strictly required with CORS_ALLOW_ALL_ORIGINS, but harmless)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# --- Misc niceties ---
TIME_ZONE = "UTC"
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
