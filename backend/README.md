# NLAS Backend — National Land Acquisition System

Node.js + Express REST API for the NLAS hackathon MVP.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ with **PostGIS** extension
- npm

## Setup

### 1. Clone & install
```bash
cd nlas-backend
npm install
```

### 2. Create the database
```bash
psql -U postgres -c "CREATE DATABASE nlas_db;"
psql -U postgres -d nlas_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env and set DB_PASSWORD and JWT_SECRET
```

### 4. Run schema + seed
```bash
node src/db/init.js   # creates all tables
node src/db/seed.js   # inserts demo data
```

### 5. Start the server
```bash
npm run dev    # development (auto-restart)
npm start      # production
```

Server runs at: **http://localhost:3000**

## Demo Login
| Field | Value |
|---|---|
| Email | `rajesh.sharma@nlas.gov.in` |
| Password | `password123` |
| Role | `CENTRAL_OFFICER` |

## Connect Frontend
In `nlas-frontend/.env`:
```
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:3000/api
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/analytics/dashboard` | Dashboard stats + charts |
| GET | `/api/projects` | List projects (search/filter/paginate) |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Project detail |
| PATCH | `/api/projects/:id` | Update project |
| GET | `/api/workflow/:projectId` | Workflow history |
| POST | `/api/workflow/transition` | Transition status |
| GET | `/api/parcels` | List parcels |
| GET | `/api/parcels/:id` | Parcel detail (owners, comp, R&R, objections) |
| GET | `/api/gis/projects/:id` | GeoJSON FeatureCollection |
| GET | `/api/gis/parcels` | Filtered parcel GeoJSON |
| GET | `/api/compensation/project/:id` | Compensation summary + records |
| POST | `/api/compensation/payment` | Record payment |
| GET | `/api/rnr/project/:id` | R&R summary + families |
| PATCH | `/api/rnr/:id` | Update R&R status |
| GET | `/api/documents/project/:id` | List documents |
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/objections` | List objections |
| PATCH | `/api/objections/:id` | Resolve objection |
| GET | `/api/audit-logs` | Audit trail |
| GET | `/api/alerts` | Alerts/notifications |
| GET | `/health` | Health check |

---

## Architecture

```
Frontend (React/Vite :5173)
         │
         │  HTTP/REST (Bearer JWT)
         ▼
Backend (Express :3000)
         │
    ┌────┴──────────────────────┐
    │  Middleware               │
    │  • helmet (security)      │
    │  • cors                   │
    │  • rate limiter           │
    │  • JWT auth               │
    │  • error handler          │
    └────┬──────────────────────┘
         │
    ┌────┴──────────────────────┐
    │  Routes                   │
    │  auth / projects /        │
    │  workflow / parcels /     │
    │  gis / compensation /     │
    │  rnr / documents /        │
    │  objections / audit /     │
    │  alerts / analytics       │
    └────┬──────────────────────┘
         │  pg (node-postgres)
         ▼
PostgreSQL 14 + PostGIS
  • users           • parcels
  • projects        • parcel_owners
  • workflow_history • compensation
  • documents       • payment_records
  • objections      • rnr
  • audit_logs      • alerts
```

## RBAC Roles

| Role | Can Do |
|---|---|
| `CENTRAL_OFFICER` | Everything |
| `STATE_OFFICER` | Projects/workflow in their state |
| `DISTRICT_OFFICER` | Projects/workflow in their district |
| `FIELD_OFFICER` | View + update R&R records |
| `VIEWER` | Read-only |

## File Structure

```
nlas-backend/
├── src/
│   ├── server.js            # Express entry point
│   ├── config/
│   │   ├── db.js            # PostgreSQL pool
│   │   └── jwt.js           # JWT config
│   ├── middleware/
│   │   ├── auth.js          # JWT verification + RBAC
│   │   └── errorHandler.js  # Global error handler
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── workflow.js
│   │   ├── parcels.js
│   │   ├── gis.js           # PostGIS ST_AsGeoJSON
│   │   ├── analytics.js
│   │   ├── compensation.js
│   │   ├── rnr.js
│   │   ├── documents.js     # Multer file upload
│   │   ├── objections.js
│   │   ├── audit.js
│   │   └── alerts.js
│   └── db/
│       ├── schema.sql        # All tables + PostGIS indexes
│       ├── seed.sql          # Demo data (PRJ-001)
│       ├── init.js           # Run schema
│       └── seed.js           # Run seed
├── uploads/                  # Document file storage
├── .env.example
└── package.json
```
