-- Database Init Script for ALFIYA - System & Admin Module

-- Drop existing tables to ensure clean slate
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS institution_merge_log CASCADE;
DROP TABLE IF EXISTS institution CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Role Permissions (RBAC)
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    resource VARCHAR(100) NOT NULL,
    can_read BOOLEAN DEFAULT false,
    can_write BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, resource)
);

-- 3. Institutions
CREATE TABLE institution (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Users (Includes Staff, Students, Admins mapped to Institution)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    institution_id VARCHAR(50) REFERENCES institution(id) ON DELETE SET NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Admin (System global super users)
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Institution Merge Log
CREATE TABLE institution_merge_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INSERT SAMPLE DATA
-- ==========================================

-- password hash for all users is "password123" 
-- (bcrypt: $2a$10$tZ2cOqPj6/M74uD1P.tL/.sRQK2qUaLg0QOMxT3lRQ7.zYm.Z37Uu)

INSERT INTO roles (name, description) VALUES
('Super Admin', 'Full system access'),
('Institution Admin', 'Can manage a specific institution'),
('Teacher', 'Can manage students and attendance'),
('Student', 'Read-only access to own records');

-- 1=Super Admin, 2=Inst Admin, 3=Teacher, 4=Student
INSERT INTO role_permissions (role_id, resource, can_read, can_write, can_delete) VALUES
(1, 'all', true, true, true),
(2, 'users', true, true, true),
(2, 'reports', true, false, false),
(3, 'attendance', true, true, false),
(4, 'profile', true, false, false);

INSERT INTO institution (id, name, address, email, phone, status) VALUES
('abc-kochi', 'ABC Academy Kochi', 'Kochi Center, Kerala', 'kochi@abcacademy.edu', '+91 9999988888', 'Active'),
('abc-kozhy', 'ABC Academy Kozhikode', 'Kozhikode Center, Kerala', 'kozhy@abcacademy.edu', '+91 9999977777', 'Active');

INSERT INTO users (institution_id, role_id, name, email, password_hash, status) VALUES
('abc-kochi', 2, 'Kochi Admin User', 'admin@kochi.com', '$2a$10$tZ2cOqPj6/M74uD1P.tL/.sRQK2qUaLg0QOMxT3lRQ7.zYm.Z37Uu', 'Active'),
('abc-kochi', 3, 'John Teacher', 'john@kochi.com', '$2a$10$tZ2cOqPj6/M74uD1P.tL/.sRQK2qUaLg0QOMxT3lRQ7.zYm.Z37Uu', 'Active'),
('abc-kozhy', 2, 'Kozhy Admin User', 'admin@kozhy.com', '$2a$10$tZ2cOqPj6/M74uD1P.tL/.sRQK2qUaLg0QOMxT3lRQ7.zYm.Z37Uu', 'Active');

INSERT INTO admin (username, email, password_hash) VALUES
('superadmin', 'super@system.com', '$2a$10$tZ2cOqPj6/M74uD1P.tL/.sRQK2qUaLg0QOMxT3lRQ7.zYm.Z37Uu');

INSERT INTO institution_merge_log (action, status, details) VALUES
('System Initialization', 'Success', 'Created initial tables and admin account.'),
('Add Branch Kochi', 'Success', 'Data imported successfully.'),
('Add Branch Kozhikode', 'Success', 'Data imported successfully.');
