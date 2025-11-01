-- Database initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- But we can add any additional setup here

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create any additional users or permissions if needed
-- (The main user is created via environment variables)

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END $$;



