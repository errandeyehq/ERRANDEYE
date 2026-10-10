# Errand Eye Deployment Guide

The frontend is a static site in `errand-eye/`; the Django API and admin live in `backend/`. GitHub Actions deploys the static site to GitHub Pages, while Railway continues to host Django.

## GitHub Pages frontend

The workflow at `.github/workflows/deploy-pages.yml` publishes the contents of `errand-eye/` whenever a commit is pushed to `main`.

1. In the GitHub repository, open **Settings > Pages**.
2. Set the Pages build and deployment source to **GitHub Actions**.
3. Push to `main`, or run **Deploy frontend to GitHub Pages** from the **Actions** tab.
4. The project site will be available at `https://errandeyehq.github.io/ERRANDEYE/`.

The static pages use relative paths for their local assets and links, so they work from the repository's project-site path.

## Railway backend

The frontend API target is configured in `errand-eye/js/api-config.js` as `https://errandeye-production.up.railway.app/api`. If the Railway service uses a different public domain, update that URL and deploy the frontend again.

In the Railway service's Django environment variables, set:

- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS` to include the Railway public hostname
- `CORS_ALLOWED_ORIGINS=https://errandeyehq.github.io`

The CORS origin is the site origin only: do not add the `/ERRANDEYE/` path or a trailing slash. If `CORS_ALLOWED_ORIGINS` is already set in Railway, it overrides the default in Django settings, so make sure the GitHub Pages origin is included in that value.

Railway should continue to use the existing `railway.json` deployment command, which runs migrations and starts Gunicorn. Confirm the backend is reachable at `https://errandeye-production.up.railway.app/api/site-content/`.

## Notes

If the Railway API is unavailable, GitHub Pages will still serve the static frontend. Dynamic content from Django will not load; the frontend keeps its built-in static fallback content. The Django admin and API remain dependent on Railway.
