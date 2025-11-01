# PLS Backend Setup Guide

This guide will help you set up and run the PLS (Prime Logic Solution) Backend project locally using Prisma with PostgreSQL.

## Prerequisites

Before starting, ensure you have the following installed on your system:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **Bun** (JavaScript runtime) - [Installation guide](https://bun.sh/docs/installation)
3. **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
4. **Git** - [Download here](https://git-scm.com/)

## Step 1: Clone and Navigate to Project

```bash
# If you haven't already cloned the repository
git clone <your-repository-url>
cd "PLS Backend New5"
```

## Step 2: Install Dependencies

```bash
# Install all project dependencies
bun install
```

## Step 3: Set Up PostgreSQL Database

### Option A: Using PostgreSQL locally

1. **Start PostgreSQL service:**

   ```bash
   # On macOS (using Homebrew)
   brew services start postgresql

   # On Ubuntu/Debian
   sudo systemctl start postgresql

   # On Windows
   # Method 1: Using Services
   # Press Win + R, type "services.msc", find PostgreSQL service and start it

   # Method 2: Using Command Prompt (Run as Administrator)
   net start postgresql-x64-15
   # Replace "15" with your PostgreSQL version number

   # Method 3: Using pgAdmin (GUI)
   # Open pgAdmin, connect to your PostgreSQL server
   # Right-click on "Servers" → "Create" → "Server"
   # Configure connection settings
   ```

2. **Create a database:**

   **For macOS/Linux:**

   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE pls_backend_db;

   # Create a user (optional but recommended)
   CREATE USER pls_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE pls_backend_db TO pls_user;

   # Exit psql
   \q
   ```

   **For Windows:**

   ```bash
   # Method 1: Using Command Prompt
   # Navigate to PostgreSQL bin directory (usually C:\Program Files\PostgreSQL\15\bin)
   psql -U postgres

   # Method 2: Using pgAdmin (Recommended for beginners)
   # 1. Open pgAdmin
   # 2. Connect to your PostgreSQL server
   # 3. Right-click on "Databases" → "Create" → "Database"
   # 4. Name: pls_backend_db
   # 5. Click "Save"

   # Method 3: Using SQL Shell (psql)
   # 1. Open "SQL Shell (psql)" from Start Menu
   # 2. Enter server, database, port, username when prompted
   # 3. Run the following commands:
   CREATE DATABASE pls_backend_db;
   CREATE USER pls_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE pls_backend_db TO pls_user;
   \q
   ```

### Option B: Using Docker for PostgreSQL only

If you prefer to use Docker just for the database:

```bash
# Create a docker-compose.yml file for just PostgreSQL
cat > docker-compose.db.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: pls_backend_db
      POSTGRES_USER: pls_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start only the database
docker-compose -f docker-compose.db.yml up -d
```

## Step 4: Environment Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Create .env file
touch .env
```

Add the following content to your `.env` file:

```env
# Environment
ENV=DEVELOPMENT
PORT=4000

# Database
DATABASE_URL="postgresql://pls_user:your_password@localhost:5432/pls_backend_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"

# Email Configuration (SMTP)
SMTP_HOST_EMAIL="your-email@gmail.com"
SMTP_SECRET="your-app-password"

# Cloudinary Configuration (for file uploads)
CLOUDINARY_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Email Whitelist
WHITE_LIST_MAILS="admin@example.com,test@example.com"

# CORS Configuration
ALLOWED_ORIGIN="[\"http://localhost:3000\", \"http://localhost:3001\", \"http://127.0.0.1:3000\"]"

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

### Important Notes for Environment Variables:

1. **DATABASE_URL**: Replace `your_password` with your actual PostgreSQL password
2. **JWT_SECRET**: Generate a strong, random secret key (at least 32 characters)
3. **SMTP Configuration**:
   - For Gmail: Use your email and an App Password (not your regular password)
   - Enable 2-factor authentication and generate an App Password
4. **Cloudinary**: Sign up at [cloudinary.com](https://cloudinary.com) for free file storage
5. **Stripe**: Sign up at [stripe.com](https://stripe.com) for payment processing

## Step 5: Database Setup with Prisma

1. **Generate Prisma Client:**

   ```bash
   bun run db:generate
   ```

2. **Run Database Migrations:**

   ```bash
   bun run db:migrate
   ```

3. **Verify Database Connection:**
   ```bash
   # Open Prisma Studio to view your database
   bun run db:studio
   ```

## Step 6: Build the Project

```bash
# Build the TypeScript project
bun run build
```

## Step 7: Run the Application

### Development Mode (with auto-reload):

```bash
bun run dev
```

### Production Mode:

```bash
bun run start
```

## Step 8: Verify Installation

1. **Check if the server is running:**

   - Open your browser and go to `http://localhost:4000`
   - You should see a response from the server

2. **Test the health endpoint:**

   ```bash
   curl http://localhost:4000/health
   ```

3. **Check Prisma Studio:**
   - Run `bun run db:studio` to open the database GUI
   - Verify that all tables are created correctly

## Available Scripts

- `bun run dev` - Start development server with auto-reload
- `bun run start` - Start production server
- `bun run build` - Build the project
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Fix ESLint issues
- `bun run type-check` - Run TypeScript type checking
- `bun run fmt` - Format code with Prettier
- `bun run db:generate` - Generate Prisma client
- `bun run db:migrate` - Run database migrations
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Prisma Studio

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/                # Configuration files
├── controllers/           # Route controllers
├── database/              # Database connection
├── middlewares/           # Express middlewares
├── routers/               # API routes
├── services/              # Business logic services
├── templates/             # Email templates
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── validation/            # Input validation schemas

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Database migration files
```

## API Endpoints

The application provides various API endpoints for:

- **Authentication**: `/api/auth/*`
- **Projects**: `/api/projects/*`
- **Users**: `/api/users/*`
- **Blog**: `/api/blog/*`
- **Contact**: `/api/contact/*`
- **Payments**: `/api/payments/*`
- **Health Check**: `/health`

## Troubleshooting

### Common Issues:

1. **Database Connection Error:**

   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Ensure database exists
   - **Windows specific**: Make sure PostgreSQL service is running in Services.msc
   - **Windows specific**: Check if PostgreSQL is in your PATH environment variable

2. **Port Already in Use:**

   - Change PORT in .env file
   - **macOS/Linux**: Kill process using the port: `lsof -ti:4000 | xargs kill -9`
   - **Windows**: Kill process using the port: `netstat -ano | findstr :4000` then `taskkill /PID <PID> /F`

3. **Prisma Client Error:**

   - Run `bun run db:generate`
   - Check if migrations are up to date
   - **Windows specific**: Ensure you're running Command Prompt as Administrator for database operations

4. **Environment Variables:**

   - Ensure all required variables are set in .env
   - Restart the server after changing .env
   - **Windows specific**: Make sure .env file is in the project root directory

5. **Windows-Specific Issues:**
   - **PostgreSQL not found**: Add PostgreSQL bin directory to PATH
     - Add `C:\Program Files\PostgreSQL\15\bin` to your system PATH
   - **Permission denied**: Run Command Prompt as Administrator
   - **psql command not found**: Use full path or add to PATH
   - **Database connection refused**: Check Windows Firewall settings

### Getting Help:

- Check the logs in the `logs/` directory
- Use `bun run db:studio` to inspect database
- Verify all environment variables are correctly set

## Next Steps

1. **Set up your frontend application** to connect to this backend
2. **Configure your email service** (SMTP settings)
3. **Set up Cloudinary** for file uploads
4. **Configure Stripe** for payment processing
5. **Set up monitoring and logging** for production

## Production Deployment

For production deployment:

1. Set `ENV=PRODUCTION` in your environment
2. Use a production PostgreSQL database
3. Configure proper CORS origins
4. Set up SSL certificates
5. Use environment-specific configuration files
6. Set up monitoring and error tracking

---

**Note**: This guide assumes you're running the project locally for development. For production deployment, additional security and performance considerations apply.
