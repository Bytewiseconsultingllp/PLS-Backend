# Docker Setup Guide

This guide explains how to run the PrimeLogic Solution Backend Server using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

1. **Clone the repository and navigate to the project directory**

   ```bash
   cd /path/to/your/project
   ```

2. **Set up environment variables**

   ```bash
   cp docker.env .env
   # Edit .env file with your actual configuration values
   ```

3. **Build and start the services**

   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Backend API: http://localhost:4000
   - Database: localhost:5432

## Environment Configuration

Before running the application, you need to configure the following environment variables in your `.env` file:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://ssingh83:password@postgres:5432/pls_backend

# Application
NODE_ENV=production
PORT=4000
ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email (SMTP)
SMTP_HOST_EMAIL=your-email@example.com
SMTP_SECRET=your-email-password

# Cloudinary (for file uploads)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Whitelist
WHITE_LIST_MAILS=admin@example.com,user@example.com

# CORS
ALLOWED_ORIGIN=["http://localhost:3000","http://localhost:4000"]

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Docker Commands

### Build and Start Services

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d --build

# Start only specific services
docker-compose up postgres app
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# View logs for specific service
docker-compose logs app
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f app
```

### Database Operations

```bash
# Access database shell
docker-compose exec postgres psql -U ssingh83 -d pls_backend

# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

# Open Prisma Studio
docker-compose exec app npx prisma studio
```

### Application Management

```bash
# Access application container shell
docker-compose exec app sh

# Restart application
docker-compose restart app

# Rebuild application
docker-compose up --build app
```

## Health Checks

The application includes health checks for both services:

- **PostgreSQL**: Checks if the database is ready to accept connections
- **Application**: Checks if the API is responding on the health endpoint

## Volumes

The following volumes are configured:

- `postgres_data`: Persistent storage for PostgreSQL data
- `./logs:/app/logs`: Application logs (mounted to host)

## Ports

- **Application**: 4000 (mapped to host port 4000)
- **PostgreSQL**: 5432 (mapped to host port 5432)

## Development vs Production

### Development

```bash
# Use development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production

```bash
# Use production environment (default)
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Check what's using the port
   lsof -i :4000
   lsof -i :5432

   # Kill the process or change ports in docker-compose.yml
   ```

2. **Database connection issues**

   ```bash
   # Check if database is running
   docker-compose ps

   # Check database logs
   docker-compose logs postgres
   ```

3. **Application not starting**

   ```bash
   # Check application logs
   docker-compose logs app

   # Check if all environment variables are set
   docker-compose exec app env
   ```

4. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Reset Everything

```bash
# Stop all services and remove everything
docker-compose down -v --remove-orphans

# Remove all images
docker system prune -a

# Start fresh
docker-compose up --build
```

## Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secrets**
3. **Configure proper CORS origins**
4. **Use environment-specific configurations**
5. **Regularly update base images**

## Monitoring

### View Resource Usage

```bash
# View container stats
docker stats

# View specific container stats
docker stats pls-backend pls-postgres
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U ssingh83 pls_backend > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U ssingh83 pls_backend < backup.sql
```

## Production Deployment

For production deployment, consider:

1. **Using Docker Swarm or Kubernetes**
2. **Setting up reverse proxy (nginx)**
3. **Configuring SSL/TLS certificates**
4. **Setting up monitoring and logging**
5. **Implementing proper backup strategies**
6. **Using secrets management**

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all required services are running
4. Check network connectivity between containers
