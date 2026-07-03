# Errand Eye Deployment Guide

This guide prepares the Errand Eye project for deployment on ListedHosting (Python Shared Hosting).

## Project structure

- `errand-eye/` — static frontend files
- `backend/` — Django backend API and admin

Recommended live setup:
- `www.errandeye.com` → frontend static site
- `api.errandeye.com` → Django backend API

## 1. Update the frontend API target

In `errand-eye/js/api-config.js`, set the live API endpoint before deployment:
```js
window.ERRAND_EYE_API_BASE = 'https://api.errandeye.com/api';
```

## 2. Prepare backend configuration

Copy `.env.example` to `.env` inside `backend/` and set production values:
- `DJANGO_SECRET_KEY` should be a secure random value
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS=www.errandeye.com,api.errandeye.com`
- `DB_NAME=<your-db-name>`
- `DB_USER=<your-db-user>`
- `DB_PASSWORD=<your-db-password>`
- `DB_HOST=<your-db-host>`
- `DB_PORT=<your-db-port>`
- `CORS_ALLOWED_ORIGINS=https://www.errandeye.com`

## 3. Upload files to the hosting account

### Static frontend
Upload the `errand-eye/` folder to the public document root of `www.errandeye.com`.

### Django backend
Upload the `backend/` folder to the Python application directory for `api.errandeye.com`.

## 4. Configure the Python app in cPanel

1. Open **Setup Python App**.
2. Create a Python 3.13 app in the correct directory.
3. Set the application entry point to `config.wsgi:application` if requested.
4. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

## 5. Create the database

1. Open **MySQL Databases**.
2. Create a new database and user.
3. Grant the user full privileges on the new database.
4. Use those credentials in `backend/.env`.

## 6. Run Django deployment commands

Use the Python app terminal or SSH in the app directory:
```bash
cd /path/to/backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

## 7. Verify live URLs

- `https://www.errandeye.com/` — static frontend
- `https://api.errandeye.com/api/site-content/` — backend API
- `https://api.errandeye.com/api/leads/` — lead form endpoint

## 8. Final checks

- SSL must be enabled for both domains
- `DJANGO_DEBUG` must be `False`
- `CORS_ALLOWED_ORIGINS` should include `https://www.errandeye.com`
- `errand-eye/js/api-config.js` must point at the live API

## Notes

If you want the frontend and backend on a single domain, host the frontend under the root domain and the Django app under a subdomain or addon domain. In that case, update `api-config.js` accordingly.
