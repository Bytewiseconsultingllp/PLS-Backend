# Frontend Test Application

This is a simple frontend application to test user registration, login, and Stripe integration with your backend API.

## Features

1. **User Registration** - Create new user accounts
2. **User Login** - Authenticate existing users
3. **Stripe Integration Test** - Test Stripe checkout session creation

## Setup Instructions

### 1. Backend Configuration

Make sure your backend is running on `http://localhost:3000` and has the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/payment/create-checkout-session` - Create Stripe checkout session

### 2. Stripe Configuration

1. Get your Stripe publishable key from the Stripe Dashboard
2. Replace the placeholder in `index.html` line 147:
   ```javascript
   stripe = Stripe("pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE");
   ```

### 3. CORS Configuration

Make sure your backend has CORS enabled for the frontend domain. Add this to your backend:

```javascript
app.use(
  cors({
    origin: "http://localhost:3000", // or your frontend URL
    credentials: true,
  }),
);
```

### 4. Static File Serving

Make sure your backend serves static files from the `public` directory:

```javascript
app.use(express.static("public"));
```

## Usage

1. Open `http://localhost:3000` in your browser
2. Register a new user account
3. Login with your credentials
4. Click "Test Stripe Checkout" to test the Stripe integration
5. You'll be redirected to Stripe's test checkout page

## Test Data

For testing, you can use:

- **Username**: `testuser123`
- **Full Name**: `Test User`
- **Email**: `test@example.com`
- **Password**: `password123`

## Stripe Test Cards

Use these test card numbers in Stripe's test mode:

- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **3D Secure**: `4000002500003155`

## Troubleshooting

1. **CORS errors**: Make sure your backend has CORS configured
2. **Authentication errors**: Check that your backend is running and accessible
3. **Stripe errors**: Verify your Stripe publishable key is correct
4. **Network errors**: Check that the API_BASE_URL matches your backend URL
