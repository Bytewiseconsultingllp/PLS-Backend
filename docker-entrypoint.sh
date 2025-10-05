#!/bin/sh

# Docker entrypoint script for the application
# This script handles database migrations and starts the application

set -e

echo "Starting application with Docker..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until npx prisma db push --accept-data-loss; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma db push

echo "Database setup completed!"

# Start the application
echo "Starting the application..."
exec "$@"



