# SmartPark – Frontend

A React (Vite) frontend for the SmartPark backend — search parking, book a
slot, pay, and manage listings.

## Design
Dark "asphalt" surface with a signal-amber accent (parking signage), Barlow
Condensed for headings, Inter for body text, and IBM Plex Mono for
prices/timestamps. Bookings render as a perforated **parking-ticket stub**
(`src/components/TicketStub.jsx`) — the page's signature element.

## Setup

```bash
cd smartpark-frontend
npm install
cp .env.example .env     # points at the backend API
npm run dev               # http://localhost:5173
```

Make sure the **backend** is running first at `http://localhost:5000`
(see `smartpark-backend/README.md`). `.env` controls the API base URL:

```
VITE_API_URL=http://localhost:5000/api
```

CORS is already enabled on the backend, so the two dev servers (5173 and
5000) talk to each other with no extra config.

## Pages

| Route | Access | What it does |
|---|---|---|
| `/` | Public | Search parking spaces by city/date |
| `/space/:id` | Public (booking needs login) | Space details, list of time slots, reserve a slot |
| `/login`, `/register` | Public | Auth — register picks "Driver" or "Space owner" |
| `/owner` | Owner only | Create listings, add availability slots, view bookings across your spaces |
| `/my-bookings` | Driver/customer only | View your tickets, pay for a pending booking, cancel |

## How it talks to the backend
`src/api/client.js` is the single place every request goes through — it
attaches the JWT from `AuthContext` (stored in `localStorage`) as a Bearer
token and normalizes error messages from the API's `{ message }` /
`{ errors: [...] }` response shapes.

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Project Structure
```
smartpark-frontend/
├── src/
│   ├── api/client.js          # fetch wrapper + all API calls
│   ├── context/AuthContext.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ParkingSpaceCard.jsx
│   │   └── TicketStub.jsx     # signature booking-ticket component
│   ├── pages/
│   │   ├── Home.jsx           # search
│   │   ├── Login.jsx / Register.jsx
│   │   ├── SpaceDetail.jsx    # view + book a slot
│   │   ├── OwnerDashboard.jsx # create listings, manage slots, view bookings
│   │   ├── MyBookings.jsx     # pay / cancel
│   │   └── NotFound.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css              # design tokens + components
├── index.html
├── vite.config.js
└── package.json
```
