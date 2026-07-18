# SmartPark — Full Stack (Backend + Frontend)

Parking reservation & management system: owners list parking spaces and
availability; drivers search, reserve, and pay.

## Folders
- `smartpark-backend/` — Node.js + Express REST API (JWT auth, bookings, payments)
- `smartpark-frontend/` — React (Vite) client that consumes the API

## Run both together

**Terminal 1 — backend**
```bash
cd smartpark-backend
npm install
cp .env.example .env
npm start
# → http://localhost:5000
```

**Terminal 2 — frontend**
```bash
cd smartpark-frontend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5173
```

Open `http://localhost:5173`. The frontend is already configured (via
`.env`) to call the backend at `http://localhost:5000/api`, and the backend
already has CORS enabled for local development.

## Try it out
1. Sign up once as a **Space owner**, once as a **Driver** (two different
   emails, or two browsers/incognito tabs).
2. As the owner: go to **Owner Dashboard** → list a parking space → expand
   **Manage availability** → add a date/time slot.
3. As the driver: search that city on the home page → open the space →
   reserve the slot → go to **My Bookings** → pay → status flips to
   *Confirmed*.
4. Back in the owner's **Bookings** tab, the same reservation shows up.

See each folder's own README for full API docs, project structure, and
production notes (swapping the JSON-file database for MySQL/Postgres, etc).
