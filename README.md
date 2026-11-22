# University of Kigali (UoK) — Booklet Verification Management System (BVMS)

This is the modernized **Node.js (Express), React (Vite + Tailwind CSS), and PostgreSQL** version of the Booklet Verification Management System, branded and tailored for the **University of Kigali (UoK)**.

---

## 1. Project Folder Structure

```text
e:\Java\Booklet_Verification\bvms-modern\
├── backend\                  # Node.js + Express + PostgreSQL REST API (Port 5000)
│   ├── src\
│   │   ├── db\
│   │   │   ├── schema.sql    # Full PostgreSQL Schema
│   │   │   ├── index.js      # PostgreSQL Pool + Automatic Seed & Fallback Engine
│   │   │   └── seed.js       # Manual PostgreSQL Seeder
│   │   ├── middlewares\
│   │   │   └── auth.js       # JWT Authentication & Role-Based Access Control
│   │   ├── routes\
│   │   │   ├── auth.js       # Login, Profile, Change Password
│   │   │   ├── admin.js      # Users, UoK Schools, Degree Programs, Students & CSV Import
│   │   │   ├── officer.js    # Invigilators, Rooms, Modules, Timetables & Seating Allocation
│   │   │   └── invigilator.js# Code128 Barcode Image Generator & Live Booklet Verification
│   │   └── server.js         # Backend Entry Point
│   ├── .env                  # Environment Configuration
│   └── package.json
└── frontend\                 # React 18 + Vite + Tailwind CSS Portal (Port 5173)
    ├── src\
    │   ├── api\client.js     # Axios Client with JWT Interceptors
    │   ├── components\       # UoKLogo, Printable A4 Barcoded BookletViewerModal
    │   ├── context\          # AuthContext
    │   ├── layouts\          # UoK Role-Based Sidebar DashboardLayout
    │   └── pages\            # Login, Profile, Admin, Officer, Invigilator, DAS Pages
    └── package.json
```

---

## 2. How to Run the System

### Prerequisites
1. **Node.js** (v18+ recommended) — Download from https://nodejs.org if not installed.
2. **PostgreSQL** (v14+ / v18 installed at `C:\Program Files\PostgreSQL\18`).
   * Create a database named `uok_bvms` in pgAdmin or psql:
     ```sql
     CREATE DATABASE uok_bvms;
     ```
   * Update `DATABASE_URL` in `bvms-modern/backend/.env` with your PostgreSQL password:
     ```env
     DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/uok_bvms
     ```
   * *Note:* When the backend starts, it automatically creates all tables from `src/db/schema.sql` and seeds initial University of Kigali schools, programs, rooms, modules, students, and staff accounts! (If your local PostgreSQL service is stopped, it also has a built-in embedded PostgreSQL engine fallback so the app runs immediately without errors).

---

### Step 1: Start the Node.js Backend (Terminal 1)
Open a terminal in `e:\Java\Booklet_Verification\bvms-modern\backend`:

```powershell
cd e:\Java\Booklet_Verification\bvms-modern\backend
npm install
npm start
```
The backend API will start at **`http://localhost:5000`** (Health check: `http://localhost:5000/api/health`).

---

### Step 2: Start the React Frontend (Terminal 2)
Open a second terminal in `e:\Java\Booklet_Verification\bvms-modern\frontend`:

```powershell
cd e:\Java\Booklet_Verification\bvms-modern\frontend
npm install
npm run dev
```
Open your browser at **`http://localhost:5173`**.

---

## 3. Default University of Kigali Demo Login Accounts

All demo accounts use password **`12345`** (and you can also click the **One-Click Demo Account** buttons directly on the login screen):

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `theoswelbeck@gmail.com` | `12345` | Manage Staff Users, UoK Schools, Degree Programs, Students & CSV Bulk Import |
| **Examination Officer** | `jolly@gmail.com` | `12345` | Manage Invigilators, Rooms, Modules, Timetables, Auto-Fill Room Seating & Batch-Print Barcoded Booklets |
| **Invigilator** | `uwambajebetty@gmail.com` | `12345` | View Assigned Exam Rooms, Live Webcam Barcode Scanner, Two-Stage Verification (`Present` & `Submitted`) |
| **Director of Academic Services (DAS)** | `das@gmail.com` | `12345` | Executive Quality Assurance Dashboard, Submission Rate Analytics & CSV Audit Export |
