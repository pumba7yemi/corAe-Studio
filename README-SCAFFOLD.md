# corAe Continuum — Scaffold MVP

## Structure
- `frontend/public` — static pages (served by Vercel)
- `frontend/css` / `frontend/js` — styles & scripts
- `frontend/api` — Vercel Functions (serverless API)

## Deploy on Vercel
1. Import this GitHub repo into Vercel.
2. Set **Root Directory** = `frontend`
3. Set **Output Directory** = `public`
4. Deploy.

## Test
- Open the deployed site.
- Go to **Tasks** section → should list items fetched from `/api/tasks/list`.

---

### Notes
- This scaffold is **frontend only**.
- API endpoints are for MVP testing — will be replaced by corAe full backend.
- All changes in this file are for **developer reference only**.
