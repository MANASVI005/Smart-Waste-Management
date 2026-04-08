\-- Smart Bin Database Schema

CREATE DATABASE IF NOT EXISTS smart_bin;
USE smart_bin;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    password VARCHAR(255) NOT NULL,
    role ENUM('resident', 'collector', 'admin') NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'Active', 'Inactive') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collector Info table
CREATE TABLE IF NOT EXISTS collectors_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    zone VARCHAR(100) DEFAULT 'Zone A',
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collector_id INT NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    capacity VARCHAR(50) DEFAULT '5 tons',
    FOREIGN KEY (collector_id) REFERENCES users(id)
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collector_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collector_id) REFERENCES users(id)
);

-- Pickups table
CREATE TABLE IF NOT EXISTS pickups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    status ENUM('pending', 'accepted', 'enroute', 'completed', 'rejected', 'cancelled') DEFAULT 'pending',
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
