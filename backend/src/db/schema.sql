-- ============================================================================
-- University of Kigali (UoK) - Booklet Verification Management System (BVMS)
-- PostgreSQL Database Schema & Initial Seed Data
-- ============================================================================

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS exam_plan CASCADE;
DROP TABLE IF EXISTS manage_invigilator CASCADE;
DROP TABLE IF EXISTS invigilator CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS module CASCADE;
DROP TABLE IF EXISTS room CASCADE;
DROP TABLE IF EXISTS faculity CASCADE;
DROP TABLE IF EXISTS department CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Schools / Departments Table
CREATE TABLE department (
    dep_id SERIAL PRIMARY KEY,
    abbreviation VARCHAR(100) NOT NULL UNIQUE,
    dep_name VARCHAR(150) NOT NULL
);

-- 2. Programs / Faculties (Options) Table
CREATE TABLE faculity (
    fac_id SERIAL PRIMARY KEY,
    abbreviation VARCHAR(100) NOT NULL,
    fac_name VARCHAR(150) NOT NULL,
    dep_id INTEGER NOT NULL REFERENCES department(dep_id) ON DELETE CASCADE
);

-- 3. Examination Rooms Table
CREATE TABLE room (
    room_id SERIAL PRIMARY KEY,
    room VARCHAR(100) NOT NULL UNIQUE,
    numberofstudent INTEGER NOT NULL CHECK (numberofstudent > 0)
);

-- 4. Academic Modules Table
CREATE TABLE module (
    id SERIAL PRIMARY KEY,
    module_code VARCHAR(100) NOT NULL UNIQUE,
    module_name VARCHAR(150) NOT NULL,
    dep_id INTEGER NOT NULL REFERENCES department(dep_id) ON DELETE CASCADE,
    fac_id INTEGER NOT NULL REFERENCES faculity(fac_id) ON DELETE CASCADE,
    year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 5)
);

-- 5. Students Table
CREATE TABLE student (
    id SERIAL PRIMARY KEY,
    reg_number VARCHAR(100) NOT NULL UNIQUE,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(50) NOT NULL,
    department INTEGER NOT NULL REFERENCES department(dep_id) ON DELETE RESTRICT,
    options INTEGER NOT NULL REFERENCES faculity(fac_id) ON DELETE RESTRICT,
    year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 5)
);

-- 6. Invigilators Table
CREATE TABLE invigilator (
    invigilator_id SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(50) NOT NULL
);

-- 7. Invigilator Room & Date Assignments Table
CREATE TABLE manage_invigilator (
    id SERIAL PRIMARY KEY,
    invigilator_id INTEGER NOT NULL REFERENCES invigilator(invigilator_id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES room(room_id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    UNIQUE (invigilator_id, room_id, exam_date)
);

-- 8. Examination Plan & Booklet Verification Table
CREATE TABLE exam_plan (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES room(room_id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    module_code VARCHAR(100) NOT NULL REFERENCES module(module_code) ON DELETE CASCADE,
    reg_number VARCHAR(100) NOT NULL REFERENCES student(reg_number) ON DELETE CASCADE,
    booklet_code VARCHAR(100) UNIQUE,
    seat_number INTEGER,
    exam_status VARCHAR(50) NOT NULL DEFAULT 'Not Submitted', -- 'Not Submitted', 'Present', 'Submitted', 'Irregularity'
    checked_in_at TIMESTAMP,
    submitted_at TIMESTAMP,
    incident_note TEXT,
    UNIQUE (room_id, exam_date, module_code, reg_number)
);

-- 9. System Users Table (Admin, Examination Officer, Invigilator, DAS)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL, -- 'admin', 'examination_officer', 'Invigilator', 'DAS'
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for fast lookups during live barcode scanning
CREATE INDEX idx_exam_plan_date_room ON exam_plan(exam_date, room_id);
CREATE INDEX idx_exam_plan_reg_number ON exam_plan(reg_number);
CREATE INDEX idx_exam_plan_booklet_code ON exam_plan(booklet_code);
