# 🏥 Hospital Management System (HMS)

A full-stack web application for managing hospital operations — including patient registration, doctor management, appointment scheduling, prescriptions, and analytics. Built with a **Node.js backend**, **HTML/CSS/JS + Tailwind CSS frontend**, and a **MySQL database** with advanced SQL features.

---

## 📁 Project Structure

```
Hospital-management-system-main/
│
├── hms-backend/              # Node.js REST API server
├── hms-frontend/             # HTML/CSS/JS frontend (Tailwind CSS)
├── Hospital management system.sql   # Full MySQL database schema + seed data
├── package.json              # Root-level dependencies (Tailwind CSS + PostCSS)
└── package-lock.json
```

---

## ⚙️ Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | HTML, CSS, JavaScript, Tailwind CSS v4 |
| Backend    | Node.js (Express)                   |
| Database   | MySQL                               |
| Styling    | Tailwind CSS v4.2, PostCSS          |

---

## 🗃️ Database Design (`Hospital management system.sql`)

The database is named `Hospital_HMS` and is structured across 7 sections:

### Tables

| Table                    | Description                                         |
|--------------------------|-----------------------------------------------------|
| `users`                  | Stores all users — admins, doctors, patients        |
| `doctors`                | Doctor-specific info (specialization, fees, timing) |
| `appointments`           | Patient-doctor appointment records                  |
| `prescriptions`          | Medicines prescribed per appointment                |
| `appointment_audit_log`  | Logs every appointment status change                |

### Views

| View                      | Purpose                                        |
|---------------------------|------------------------------------------------|
| `vw_appointments_full`    | Complete appointment details (joined)           |
| `vw_doctor_stats`         | Per-doctor revenue, appointment counts          |
| `vw_patient_history`      | Patient's full appointment history              |
| `vw_todays_appointments`  | Today's schedule                               |

### Stored Procedures

| Procedure                       | Description                                              |
|---------------------------------|----------------------------------------------------------|
| `sp_book_appointment`           | Books an appointment, prevents duplicates                |
| `sp_add_doctor`                 | Inserts a user + doctor record atomically                |
| `sp_get_doctor_dashboard`       | Returns doctor profile + their appointments              |
| `sp_mark_completed_appointments`| Auto-marks past approved appointments as completed       |

### Triggers

| Trigger                          | Action                                                   |
|----------------------------------|----------------------------------------------------------|
| `trg_appointment_status_change`  | Logs status changes to `appointment_audit_log`           |
| `trg_prevent_past_booking`       | Prevents booking for past dates                          |
| `trg_users_updated_at`           | Auto-updates `updated_at` on user record changes         |

### Indexes (Performance Optimization)

Indexes are defined on frequently queried fields: `patient_id`, `doctor_id`, `appointment_date`, `status`, `email`, `role`.

---

## 👥 User Roles

| Role      | Capabilities                                                              |
|-----------|---------------------------------------------------------------------------|
| `admin`   | Full system access — manage doctors, patients, view analytics             |
| `doctor`  | View their schedule, update appointment status, write prescriptions       |
| `patient` | Register, book appointments, view history and prescriptions               |

### Seed Credentials (for testing)

| Role    | Email              | Password |
|---------|--------------------|----------|
| Admin   | admin@hms.com      | admin123 |
| Doctor  | ramesh@hms.com     | doc123   |
| Doctor  | sunita@hms.com     | doc123   |
| Doctor  | anil@hms.com       | doc123   |
| Patient | rahul@hms.com      | pat123   |
| Patient | priya@hms.com      | pat123   |

> ⚠️ These are for development/testing only. Change all passwords before deploying to production.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MySQL](https://www.mysql.com/) v8+
- npm

---

### 1. Clone the Repository

```bash
git clone https://github.com/Pradyun-Nimaje/Hospital-management-system-main.git
cd Hospital-management-system-main
```

---

### 2. Set Up the Database

Open MySQL and run the SQL file to create the database, tables, views, procedures, triggers, and seed data:

```bash
mysql -u root -p < "Hospital management system.sql"
```

Or using MySQL Workbench / phpMyAdmin — import the file `Hospital management system.sql`.

This will:
- Create the `Hospital_HMS` database
- Create all 5 tables with foreign key constraints
- Set up 4 views, 4 stored procedures, 3 triggers
- Insert sample admin, doctor, and patient data

---

### 3. Configure the Backend

Navigate to the backend folder:

```bash
cd hms-backend
npm install
```

Create a `.env` file (if not already present) with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=Hospital_HMS
PORT=5000
```

Start the backend server:

```bash
node index.js
# or
npm start
```

The API will run on `http://localhost:5000` (or your configured port).

---

### 4. Set Up the Frontend

Navigate to the frontend folder:

```bash
cd ../hms-frontend
```

The frontend uses **Tailwind CSS v4** with PostCSS. To build styles from the project root:

```bash
cd ..
npm install
npx tailwindcss -i ./hms-frontend/input.css -o ./hms-frontend/output.css --watch
```

Then open `hms-frontend/index.html` in your browser, or serve it with a simple HTTP server:

```bash
npx serve hms-frontend
```

---

## 📊 Key Features

- **User Authentication** — Role-based login for admin, doctor, and patient
- **Doctor Management** — Add doctors with specialization, fees, timing, and experience
- **Appointment Booking** — Book, approve, cancel, or complete appointments
- **Duplicate Prevention** — Stored procedure prevents double-booking same doctor on same day
- **Past-Date Guard** — Trigger blocks appointments from being booked in the past
- **Prescriptions** — Doctors can record medicines, dosage, duration, and instructions
- **Audit Trail** — Every appointment status change is automatically logged
- **Doctor Dashboard** — View profile, schedule, and patient notes in one query
- **Analytics Views** — Revenue per doctor, patient history, today's schedule, and more

---

## 🛠️ Useful Database Queries

```sql
-- All appointments with full details
SELECT * FROM vw_appointments_full;

-- Revenue and stats per doctor
SELECT * FROM vw_doctor_stats ORDER BY total_revenue DESC;

-- A patient's appointment history
SELECT * FROM vw_patient_history;

-- Today's appointments
SELECT * FROM vw_todays_appointments;

-- Book an appointment via stored procedure
CALL sp_book_appointment(5, 1, '2026-05-01', @msg);
SELECT @msg;

-- Auto-mark past approved appointments as completed
CALL sp_mark_completed_appointments();

-- Check audit log
SELECT * FROM appointment_audit_log ORDER BY changed_at DESC;
```

---

## 📂 Folder Details

### `hms-backend/`
Node.js REST API. Connects to MySQL (`Hospital_HMS`) and exposes endpoints for:
- User login / registration
- Doctor CRUD
- Appointment management
- Prescription management

### `hms-frontend/`
Static HTML/CSS/JS pages styled with Tailwind CSS v4. Likely includes pages for:
- Login / Registration
- Admin dashboard
- Doctor dashboard
- Patient dashboard
- Appointment booking form

### `Hospital management system.sql`
Complete MySQL schema — 353 lines covering table definitions, indexes, views, stored procedures, triggers, seed data, and sample queries. Import this file to get the database running instantly.

---

## 🔒 Security Notes

- Passwords in the seed data are stored as plain text — **hash passwords with bcrypt** before going to production
- Use environment variables for all database credentials (never hardcode them)
- Implement JWT or session-based authentication in the backend
- Validate and sanitize all user inputs to prevent SQL injection

---

## 📌 ER Diagram
The Entity-Relationship diagram below shows all entities, their attributes, and the relationships between them.
<img width="852" height="495" alt="image" src="https://github.com/user-attachments/assets/d9da76df-ca4a-4ee8-83d8-b2dc06484f82" />


## 📌 Relational Schema
The relational schema below shows the physical table structures as implemented in MySQL, including data types, primary keys, foreign keys, indexes, and triggers.
<img width="852" height="495" alt="image" src="https://github.com/user-attachments/assets/a92e95a7-f0b4-43ef-b4e0-5abf903ab2c1" />


## 📌 Project Info

| Field       | Detail                                |
|-------------|---------------------------------------|
| Author      | Pradyun Devidas Nimaje                |
| Type        | DBMS / Full-Stack Web Project         |
| Database    | MySQL (`Hospital_HMS`)                |
| Frontend    | HTML + Tailwind CSS v4                |
| Backend     | Node.js                               |
| Repo        | [GitHub](https://github.com/Pradyun-Nimaje/Hospital-management-system-main) |

---
