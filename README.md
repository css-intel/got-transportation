# Nita Jr. Get On Through (G.O.T) Transportation - MVP

A production-ready ride booking web application for personal transportation and medical courier services.

## Tech Stack

- **Frontend:** React + Tailwind CSS (Vite)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (via Sequelize ORM)
- **Payments:** Stripe API
- **Maps:** Google Maps Distance Matrix API
- **Auth:** JWT (JSON Web Tokens)

## Folder Structure

```
got-transportation/
├── backend/
│   ├── src/
│   │   ├── config/       # App config & DB connection
│   │   ├── middleware/    # Auth, admin, MVP payment checks
│   │   ├── models/       # Sequelize models (User, Booking, MvpPayment)
│   │   ├── routes/       # API routes (auth, bookings, payments, admin, webhooks)
│   │   ├── utils/        # Email service, fare calculator
│   │   └── server.js     # Express server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Footer, MvpPaymentModal, DemoWatermark
│   │   ├── context/      # AuthContext, MvpContext
│   │   ├── pages/        # Home, Login, Register, BookRide, MyBookings, Admin
│   │   ├── utils/        # API helper
│   │   ├── App.jsx       # Routes & providers
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Tailwind + custom styles
│   ├── .env.example
│   ├── netlify.toml
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Database Schema

### users
| Column    | Type         | Notes              |
|-----------|-------------|---------------------|
| id        | UUID (PK)    | Auto-generated     |
| name      | VARCHAR(100) | Required           |
| email     | VARCHAR(255) | Unique, required   |
| password  | VARCHAR(255) | Bcrypt hashed      |
| phone     | VARCHAR(20)  | Optional           |
| role      | ENUM         | customer / admin   |
| createdAt | TIMESTAMP    | Auto               |
| updatedAt | TIMESTAMP    | Auto               |

### bookings
| Column                 | Type         | Notes                                       |
|------------------------|-------------|----------------------------------------------|
| id                     | UUID (PK)    | Auto-generated                              |
| user_id                | UUID (FK)    | References users.id                         |
| pickup_address         | VARCHAR(500) | Required                                    |
| dropoff_address        | VARCHAR(500) | Required                                    |
| service_type           | ENUM         | personal_transportation / medical_courier   |
| scheduled_at           | TIMESTAMP    | Null if ASAP                                |
| is_asap                | BOOLEAN      | Default true                                |
| distance_miles         | DECIMAL      |                                              |
| fare                   | DECIMAL      | Calculated fare                             |
| status                 | ENUM         | pending/confirmed/completed/cancelled       |
| stripe_payment_intent_id | VARCHAR    | Stripe PI ID                                |
| payment_status         | ENUM         | pending/paid/failed/refunded               |
| createdAt              | TIMESTAMP    | Auto                                        |
| updatedAt              | TIMESTAMP    | Auto                                        |

### mvp_payments
| Column                   | Type       | Notes                  |
|--------------------------|-----------|-------------------------|
| id                       | UUID (PK)  | Auto-generated         |
| stripe_session_id        | VARCHAR    | Checkout session ID    |
| stripe_payment_intent_id | VARCHAR    | Payment intent ID      |
| amount                   | INTEGER    | In cents (125000)      |
| status                   | ENUM       | pending/completed/failed|
| paid_at                  | TIMESTAMP  | When paid              |
| createdAt                | TIMESTAMP  | Auto                   |
| updatedAt                | TIMESTAMP  | Auto                   |

## Fare Calculation

```
Base Fare:            $8.00
Per Mile Rate:        $2.50
Medical Courier Flat: $10.00 (if medical_courier selected)

Total = Base + (distance × perMile) + medicalFlat
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Stripe account (test mode)
- Google Maps API key (optional, falls back to estimates)

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your values
npm install

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your values
npm install
```

### 2. Configure Environment Variables

**Backend `.env`:**
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/got_transportation
JWT_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MVP_PAYMENT_AMOUNT=125000
GOOGLE_MAPS_API_KEY=your-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=app-password
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@gottransportation.com
ADMIN_PASSWORD=AdminSecure123!
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GOOGLE_MAPS_API_KEY=your-key
```

### 3. Create Database

```sql
CREATE DATABASE got_transportation;
```

### 4. Run

```bash
# Backend (auto-syncs schema)
cd backend && npm start

# Frontend
cd frontend && npm run dev
```

### 5. Default Admin Login
- Email: `admin@gottransportation.com`
- Password: `AdminSecure123!`

## Stripe Webhook Configuration

### Local Development
```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

### Production
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-backend-url.com/api/webhooks/stripe`
3. Listen for events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## MVP Payment Gate

- After 2 minutes of browsing, a modal appears prompting for MVP approval payment ($1,250 deposit)
- Until paid: Admin dashboard is read-only with watermark
- After Stripe confirms payment via webhook: Full functionality unlocked

## Deployment

### Frontend → Netlify (3 Options)

**Option A: Netlify Drop (Fastest — No CLI Needed)**
1. Open https://app.netlify.com/drop in your browser
2. Drag the `frontend/dist` folder onto the page
3. Your site will be live instantly with a random URL
4. Claim the site to get a permanent URL and custom domain

**Option B: Netlify CLI**
```bash
cd frontend
npm install -g netlify-cli
netlify login
netlify deploy --dir=dist --prod
```

**Option C: Node.js Deploy Script (No CLI Needed)**
```bash
cd frontend
# Get your token from: https://app.netlify.com/user/applications#personal-access-tokens
node deploy-netlify.js --token YOUR_NETLIFY_TOKEN
```

**Option D: Git-Based Deploy (Recommended for CI/CD)**
1. Push the repo to GitHub
2. Go to https://app.netlify.com → "Import an existing project"
3. Select your GitHub repo
4. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Add environment variables in Netlify UI:
   - `VITE_API_URL` = your backend URL
   - `VITE_STRIPE_PUBLISHABLE_KEY` = your Stripe publishable key
   - `VITE_GOOGLE_MAPS_API_KEY` = your Google Maps key

**Pre-built files are ready at:**
- `frontend/dist/` — Production build output
- `frontend/dist.zip` — Zipped for manual upload

### Backend → Render / AWS
- Set all environment variables from `.env.example`
- Start command: `npm start`
- Port: 5000
- Ensure PostgreSQL database is provisioned
- Configure Stripe webhook endpoint pointing to `/api/webhooks/stripe`

### Environment Variables Checklist
| Variable | Where | Description |
|----------|-------|-------------|
| DATABASE_URL | Backend | PostgreSQL connection string |
| JWT_SECRET | Backend | Random secret for JWT signing |
| STRIPE_SECRET_KEY | Backend | Stripe secret key (sk_test_...) |
| STRIPE_WEBHOOK_SECRET | Backend | Stripe webhook signing secret |
| GOOGLE_MAPS_API_KEY | Backend | Google Maps Distance Matrix API key |
| FRONTEND_URL | Backend | Your Netlify frontend URL |
| VITE_API_URL | Frontend | Your backend API URL |
| VITE_STRIPE_PUBLISHABLE_KEY | Frontend | Stripe publishable key (pk_test_...) |

## Security Features
- JWT authentication
- Bcrypt password hashing (12 rounds)
- Helmet security headers
- Rate limiting (100 req/15 min)
- Input validation (express-validator)
- CORS configured
- Stripe webhook signature verification
- Admin route protection
