-- MySQL initialization script for Jiya Lal Halwai
-- This runs only when the database is first created

CREATE DATABASE IF NOT EXISTS jiyalal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE jiyalal_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON jiyalal_db.* TO 'jiyalal'@'%';
FLUSH PRIVILEGES;

-- Note: Tables are created by Spring Boot JPA (ddl-auto=update)
-- This script just ensures DB and permissions are correct
