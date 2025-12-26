-- Migration: Add email verification support
-- Run this to update existing database

-- Add is_verified column to users table (MySQL doesn't support IF NOT EXISTS in ALTER)
-- This will fail silently if column already exists
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE AFTER is_active;

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
