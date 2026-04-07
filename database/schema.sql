-- Smart Bin Database Schema

CREATE DATABASE IF NOT EXISTS smart_bin;
USE smart_bin;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('resident', 'collector', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pickups table
CREATE TABLE IF NOT EXISTS pickups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    status ENUM('pending', 'scheduled', 'completed', 'cancelled') DEFAULT 'pending',
    address TEXT NOT NULL,
    scheduled_date DATE,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'in-review', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Mock Data for Pickups (Optional)
-- INSERT INTO pickups (user_id, type, status, address, scheduled_date) VALUES (1, 'General Waste', 'scheduled', '123 Green St', '2025-01-30');
