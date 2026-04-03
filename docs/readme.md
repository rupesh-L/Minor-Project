# Bookstore Project Documentation

This repository contains a full-stack bookstore platform with:

- A React + Vite frontend in `client`
- A Node.js + Express backend in `server`
- Project-level documentation in `docs`

The application supports browsing and searching books, authentication flows, cart and ordering, an admin dashboard with analytics, chatbot integration, and real-time notifications using Socket.IO.

## High-Level Architecture

- **Frontend (`client`)**
  - React 19 app with React Router-based navigation
  - Redux Toolkit for state management
  - `redux-persist` for persisted auth/cart state
  - Axios for API calls
  - Socket.IO client for realtime notifications
  - Tailwind CSS + DaisyUI for styling

- **Backend (`server`)**
  - Express API mounted under `/api/v1/*`
  - MongoDB via Mongoose for primary data storage
  - Upstash Redis connection support
  - JWT/cookie-based auth middleware
  - File upload handling with Multer + Cloudinary integration
  - Socket.IO server for realtime admin-to-user notifications
  - AI/chat endpoint support

## Project Structure

```text
Minor/
├─ client/
│  ├─ src/
│  │  ├─ components/     # UI building blocks
│  │  ├─ layout/         # Route/layout wrappers
│  │  ├─ listeners/      # Realtime listener components
│  │  ├─ pages/          # Route-level pages
│  │  ├─ redux/          # Store + slices
│  │  ├─ routes/         # Protected/admin route guards
│  │  └─ services/       # API/socket helpers
│  └─ package.json
├─ server/
│  ├─ controllers/       # Route handlers and business logic
│  ├─ middlewares/       # Auth and request middlewares
│  ├─ models/            # Mongoose schemas
│  ├─ routes/            # API route modules
│  ├─ services/          # Service layer utilities
│  ├─ templates/         # Email/other templates
│  ├─ utils/             # DB, redis, uploads, helpers
│  ├─ index.js           # Main server + socket bootstrap
│  └─ package.json
└─ docs/
   └─ readme.md
```

## Frontend Overview

Frontend entry point is `client/src/main.jsx`, where the app is wrapped with:

- `Provider` (Redux store)
- `PersistGate` (persisted state hydration)
- `BrowserRouter` (routing)

Routing is defined in `client/src/App.jsx` and includes:

- Public pages: home, shop, book details, auth, search, contact, notification
- Auth-protected pages: cart, profile, checkout, orders
- Admin-protected dashboard pages: users, books, orders, analytics
- Cross-cutting components: toast notifications, chatbot, realtime listener

## Backend Overview

Backend entry point is `server/index.js`:

- Loads environment variables with `dotenv`
- Connects to MongoDB and Redis
- Configures security and parsing middleware (`helmet`, `cors`, cookies, JSON/urlencoded parsers)
- Mounts all API route groups
- Creates HTTP server and attaches Socket.IO

### Route Groups (Base: `/api/v1`)

- `/auth`
  - Signup, signin, signout
  - OTP verification for signup/forgot-password
- `/user`
  - Profile fetch/update
  - OTP resend
- `/book`
  - Create/update books (admin protected)
  - Get all books, single book, global search
  - Add reviews
- `/admin`
  - Users, books, orders overview
  - Sales analytics, top books, order-status chart, AI insights
- `/cart`
  - Add item, remove item, get cart
- `/order`
  - Place order, get user orders, update order
- `/bestseller`
  - Mark best sellers by year (admin protected), fetch best sellers
- `/chat`
  - Chat endpoint

## Realtime Notifications

Socket.IO is initialized in `server/index.js` and consumed by `client/src/services/socket.js`.

Current flow:

- Client registers user socket with `register` event
- Server stores active user sockets in memory (`onlineUsers`)
- Admin can send direct or bulk messages
- Messages are persisted and replayed on reconnect (`loadMessages`)

## Environment Variables

Create `server/.env` with at least:

```env
PORT=5000
ATLAS_URI=your_mongodb_connection_string
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
JWT_SECRET=your_jwt_secret
```

If you use uploads/email/chat integrations, include related provider keys expected by those modules.

## Local Development Setup

### 1) Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2) Run backend

```bash
cd server
npm run dev
```

Backend starts on `http://localhost:5000` by default.

### 3) Run frontend

```bash
cd client
npm run dev
```

Frontend starts on Vite default `http://localhost:5173`.

## Available Scripts

### Server (`server/package.json`)

- `npm run dev` - start backend with nodemon
- `npm start` - start backend with node
- `npm run seed` - run seed script

### Client (`client/package.json`)

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Notes for Contributors

- Keep backend and frontend environment values aligned with CORS/socket URLs.
- API base paths are versioned under `/api/v1`.
- For production deployment, configure secure cookies/CORS origins and move hard-coded localhost origins to environment-based settings.
