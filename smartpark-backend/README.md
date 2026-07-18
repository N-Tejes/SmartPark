# SmartPark – Parking Reservation & Management System (Backend)

A complete REST API backend for a smart parking platform where **owners** list
parking spaces and mark availability, and **customers** search, reserve, and
pay for bookings.

## Features
1. Search & reserve parking spaces
2. Manage availability (owner adds time-slots per parking space)
3. Track booking & payment records

## Tech Stack
- **Runtime:** Node.js + Express
- **Database:** lowdb (JSON file, `database.json`) — zero-setup, pure JS, no native
  build tools required. Swap for MySQL/Postgres via Sequelize for production
  (see `config/db.js` for notes on where to plug that in).
- **Auth:** JWT (jsonwebtoken) + bcryptjs password hashing
- **Validation:** express-validator

## Project Structure
```
smartpark-backend/
├── config/
│   └── db.js                # lowdb connection + collection defaults
├── controllers/
│   ├── authController.js
│   ├── parkingSpaceController.js
│   ├── bookingController.js
│   └── paymentController.js
├── middleware/
│   ├── auth.js               # JWT protect() + role authorize()
│   ├── validate.js           # express-validator error handler
│   └── errorHandler.js       # 404 + global error handler
├── models/
│   ├── User.js
│   ├── ParkingSpace.js
│   ├── Slot.js
│   ├── Booking.js
│   └── Payment.js
├── routes/
│   ├── authRoutes.js
│   ├── parkingSpaceRoutes.js
│   ├── bookingRoutes.js
│   └── paymentRoutes.js
├── utils/
│   └── generateToken.js
├── app.js                    # Express app + route mounting
├── server.js                 # entry point
├── .env.example
└── package.json
```

## Setup & Run

```bash
cd smartpark-backend
npm install
cp .env.example .env      # then edit JWT_SECRET
npm start                 # or: npm run dev  (nodemon, auto-restart)
```

Server runs at `http://localhost:5000`. Data persists to `database.json`
in the project root (auto-created on first run, gitignored).

## Data Model / Entities

| Entity | Key Fields |
|---|---|
| **User** | id, name, email, password (hashed), phone, role (`owner`\|`customer`\|`admin`) |
| **ParkingSpace** | id, ownerId, title, address, city, lat/long, totalSlots, pricePerHour, status |
| **Slot** | id, parkingSpaceId, date, startTime, endTime, isAvailable |
| **Booking** | id, userId, parkingSpaceId, slotId, date, startTime, endTime, status, totalAmount |
| **Payment** | id, bookingId, amount, paymentStatus, paymentMethod, transactionId, paidAt |

**Relationships:** User (owner) 1—N ParkingSpace 1—N Slot; User (customer) 1—N Booking;
ParkingSpace 1—N Booking; Booking 1—1 Payment.

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register as owner or customer |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Bearer token | Get current user profile |

### Parking Spaces
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/parking-spaces` | Owner | Create a new listing |
| GET | `/api/parking-spaces/search?city=&date=&minPrice=&maxPrice=` | Public | Search available spaces |
| GET | `/api/parking-spaces/owner/me` | Owner | List my own spaces |
| GET | `/api/parking-spaces/:id` | Public | Get space details + its slots |
| PUT | `/api/parking-spaces/:id` | Owner (must own) | Update a listing |
| DELETE | `/api/parking-spaces/:id` | Owner (must own) | Delete a listing |
| POST | `/api/parking-spaces/:id/slots` | Owner (must own) | Add an availability slot |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings` | Customer | Reserve a slot (`{ slotId }`) |
| GET | `/api/bookings/me` | Customer | My bookings |
| GET | `/api/bookings/owner/me` | Owner | Bookings across my spaces |
| GET | `/api/bookings/:id` | Booking owner / space owner | Booking details + payment |
| PUT | `/api/bookings/:id/cancel` | Customer (must own booking) | Cancel + free the slot |

### Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments` | Customer | Pay for a booking (`{ bookingId, paymentMethod }`) |
| GET | `/api/payments/booking/:bookingId` | Owner of booking / admin | Get payment record |

## Example Flow (curl)

```bash
# 1. Register owner
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ravi","email":"ravi@example.com","password":"password123","role":"owner"}'

# 2. Register customer
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Tejas","email":"tejas@example.com","password":"password123","role":"customer"}'

# 3. Owner creates a parking space (use token from step 1)
curl -X POST http://localhost:5000/api/parking-spaces \
  -H "Content-Type: application/json" -H "Authorization: Bearer OWNER_TOKEN" \
  -d '{"title":"MG Road Parking","address":"MG Road","city":"Bengaluru","totalSlots":10,"pricePerHour":50}'

# 4. Owner adds a slot (use SPACE_ID from step 3 response)
curl -X POST http://localhost:5000/api/parking-spaces/SPACE_ID/slots \
  -H "Content-Type: application/json" -H "Authorization: Bearer OWNER_TOKEN" \
  -d '{"date":"2026-07-05","startTime":"10:00","endTime":"12:00"}'

# 5. Customer searches
curl "http://localhost:5000/api/parking-spaces/search?city=Bengaluru&date=2026-07-05"

# 6. Customer books the slot (use SLOT_ID from step 4 response)
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{"slotId":"SLOT_ID"}'

# 7. Customer pays (use BOOKING_ID from step 6 response)
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{"bookingId":"BOOKING_ID","paymentMethod":"upi"}'
```

## Key Design Decisions

- **Double-booking prevention:** a slot is marked `isAvailable: false` the
  moment a booking is created (before payment), so no two customers can
  reserve the same slot. If a customer never pays, in a production system
  you'd add a cron job to auto-cancel stale `pending` bookings and free the
  slot again.
- **Cancellation:** freeing the slot and (if paid) marking the payment
  `refunded` happen together so availability stays accurate.
- **Role-based access:** `protect` middleware verifies the JWT;
  `authorize(...roles)` restricts routes to `owner`, `customer`, or `admin`.
- **Ownership checks:** owners can only edit/delete/add slots to spaces they
  created; customers can only cancel their own bookings.

## Swapping in a Real SQL Database

The model files (`models/*.js`) are the only place that talk to storage, via
simple functions (`create`, `findById`, etc.). To move to MySQL/Postgres:
1. Add `sequelize` + a DB driver (`mysql2` or `pg`) to `package.json`.
2. Define Sequelize models mirroring the fields documented above.
3. Reimplement each model file's exported functions using Sequelize calls.
4. Controllers and routes require no changes.

## Suggested Next Steps
- Add refresh tokens / token blacklist on logout
- Add pagination to search & list endpoints
- Integrate a real payment gateway (Razorpay/Stripe) webhook instead of the simulated success in `paymentController.js`
- Add a cron job to expire unpaid `pending` bookings and release slots
- Add automated tests (Jest + Supertest)
