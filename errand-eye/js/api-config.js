/* ============================================================
   ERRAND EYE - API CONFIG
   Single place to point the site at the Django admin backend.
   The same Django app serves both this frontend and /api/, so a
   same-origin relative path works wherever it's deployed.
   ============================================================ */
window.ERRAND_EYE_API_BASE = '/api';
