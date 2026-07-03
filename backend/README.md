# Errand Eye Admin

Django admin dashboard + API backing the Errand Eye marketing site (`../errand-eye`).

Manages: quote/contact leads, gallery photos, testimonials, pricing packages,
site contact info, and award badges/stats.

## Stack

- Django 4.2 LTS (chosen for MariaDB 10.4+ compatibility, common on shared/cPanel hosting)
- MySQL / MariaDB via PyMySQL (pure-Python driver, no C build tools needed)
- Plain Django views for the API (no DRF) returning JSON

## Local setup

1. Create the database on your local MySQL server (port 3306):
   ```sql
   CREATE DATABASE errandeye_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   Uses your existing local `root` MySQL user, same as your other projects.
2. Copy `.env.example` to `.env` and fill in your DB password.
3. Set up the virtualenv and install deps:
   ```bash
   python -m venv venv
   source venv/Scripts/activate   # Windows Git Bash
   pip install -r requirements.txt
   ```
4. Migrate and create an admin user:
   ```bash
   python manage.py migrate
   python manage.py create_dev_superuser   # prints a random password once
   ```
5. Run it:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   Admin: http://127.0.0.1:8000/admin/
   API: http://127.0.0.1:8000/api/site-content/

## API

- `GET /api/site-content/` — combined read of gallery, testimonials, pricing,
  awards, stats, and contact info (published items only). The static site
  fetches this once per page load.
- `POST /api/leads/` — creates a Lead from the contact form. Body:
  `{name, email, phone, service, message}`. `name` and `message` are required.

CORS is restricted to the origins listed in `CORS_ALLOWED_ORIGINS` (`.env`).

## Frontend wiring (`../errand-eye`)

The static site is wired to this backend via two scripts, loaded on every
page right before `js/main.js`:

- `js/api-config.js` — sets `window.ERRAND_EYE_API_BASE`. **This is the one
  line to change when deploying** (point it at the live API domain).
- `js/site-content.js` — on page load, fetches `/api/site-content/` and:
  - Always overlays site-wide contact info (phone, email, WhatsApp links,
    offices, hours) onto elements tagged `data-contact="..."` in the footer
    and CTA sections.
  - Replaces testimonials, stats (homepage only, expects exactly 4), the
    awards marquee, pricing cards (About page), and the gallery grid
    **only if the API returns data** for that section — otherwise the
    existing static HTML stays as a fallback, so the site never looks
    broken or empty just because nothing's been added in the admin yet.
  - Wires the "Request a Quote" toggle button + form to `POST /api/leads/`.

Seed some sample content to see it working end-to-end:
```bash
python manage.py seed_dev_content
```
(Remove it again from the admin, or via the ORM, once you're done checking.)

## Deploying to cPanel

1. Most cPanel hosts (including common Nigerian providers like Whogohost,
   Truehost, QServers) have a **Setup Python App** tool that runs Django via
   Passenger — no separate server process to manage.
2. Create the MySQL database and user from cPanel's **MySQL Databases** tool
   (note cPanel prefixes both with your cPanel username, e.g.
   `cpaneluser_errandeye`).
3. Set `.env` on the server with `DJANGO_DEBUG=False`, the production
   `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` (your domain), the DB
   credentials from step 2, and `CORS_ALLOWED_ORIGINS` set to the live site's
   URL.
4. Run `python manage.py migrate` and `python manage.py createsuperuser` in
   the app's terminal (cPanel's Python App page gives you one), then
   `python manage.py collectstatic`.
5. Point the static site (`../errand-eye`) at the live API URL instead of
   `127.0.0.1:8000`.
