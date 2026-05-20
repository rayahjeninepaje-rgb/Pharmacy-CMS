# HopeCMS — Hope, Inc. Customer Management System

A web-based Customer Management System built for Hope, Inc. that manages customer records and provides read-only views of purchase history with role-based access control.

**Course:** Information Management 2 | New Era University  
**Instructor:** Jeremias C. Esperanza  
**Academic Year:** 2025–2026

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| State | React Context API |
| Version Control | Git + GitHub |
| Deployment | Vercel / Netlify |

---

## Features

- **Customer CRUD** — Add, edit, and soft-delete customer records (no hard deletes)
- **Sales History** — View each customer's transaction history (read-only)
- **Sales Detail** — Drill into transactions to see line items with product and price
- **Product Catalogue** — Read-only listing of all products with current prices
- **Role-Based Access Control** — SUPERADMIN, ADMIN, and USER with 9 configurable rights
- **Account Activation** — New accounts are USER/INACTIVE until activated by an Admin
- **Google OAuth** — Sign in with Google or email/password

---

## User Roles

| Role | Description |
|---|---|
| **SUPERADMIN** | Full access. Only role that can soft-delete customers. Cannot be modified by others. |
| **ADMIN** | Can add and edit customers. Can activate/deactivate USER accounts. Cannot soft-delete. |
| **USER** | Read-only. Can view active customers and their sales history. |

---

## Project Setup

### Prerequisites
- Node.js v18+
- npm
- A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/<neu>/hope-cms.git
cd hope-cms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Set up the database

Run the migration files in order in your Supabase **SQL Editor**:

```
db/migrations/01_rls_policies.sql   — Row Level Security policies
db/migrations/02_views.sql          — SQL views for reports
db/migrations/03_seed.sql           — Modules, rights, and SUPERADMIN seed
db/migrations/04_functions.sql      — Trigger and helper functions
```

> In `03_seed.sql`, replace `<AUTH_UUID>` with the actual UUID of the SUPERADMIN account from **Supabase → Authentication → Users**.

### 5. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Branch Structure

| Branch | Purpose |
|---|---|
| `main` | Production-ready code only. Protected. |
| `dev` | Integration branch for all features. Protected. |
| `feature/*` | Individual feature branches. Merge into `dev` via PR. |

---

## Database Migrations

All SQL scripts are in `/db/migrations/`:

| File | Description |
|---|---|
| `01_rls_policies.sql` | RLS policies for all tables |
| `02_views.sql` | `product_current_price`, `customer_sales_summary`, `product_revenue` views |
| `03_seed.sql` | Modules, rights seed data, SUPERADMIN user |
| `04_functions.sql` | `provision_new_user()` trigger + `get_all_users()` function |

---

## Core Rules

- **No hard deletes.** The `DELETE` keyword must never appear in application code or Supabase functions. Customer removals are soft-deletes (`record_status = 'INACTIVE'`).
- **INACTIVE customers are invisible to USER accounts** in all views. RLS enforces this at the database level.
- **ADMIN cannot modify SUPERADMIN** accounts — enforced at both UI and RLS levels.
- **sales, salesDetail, product, and priceHist are view-only** for all user types. No add, edit, or delete operations are permitted.

---

## Deployment

Deploy to Vercel or Netlify. Add the following environment variables in your hosting dashboard:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Also add your production URL to **Supabase → Authentication → URL Configuration → Redirect URLs**.

---

## Team

| # | Role |
|---|---|
| M1 | Project Lead / Full-Stack |
| M2 | Frontend Developer (UI/UX) |
| M3 | Backend / DB Engineer |
| M4 | Rights & Auth Specialist |
| M5 | QA / Documentation |
