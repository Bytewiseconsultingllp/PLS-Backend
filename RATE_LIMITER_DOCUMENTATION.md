## Overview

The rate limiter middleware provides comprehensive protection against abuse, DDoS attacks, and excessive API usage. It uses database-backed rate limiting with Prisma and the `rate-limiter-flexible` library.

## Features

✅ **Database-Backed Persistence** - Rate limits survive server restarts
✅ **IP-Based Tracking** - Tracks requests by client IP address
✅ **Proxy Support** - Correctly identifies IPs behind proxies/load balancers
✅ **Per-Endpoint Configuration** - Different limits for different endpoints
✅ **Key Prefixes** - Isolated rate limits per endpoint (no cross-contamination)
✅ **Whitelist Support** - Bypass rate limiting for specific IPs
✅ **Rate Limit Headers** - Returns standard `X-RateLimit-*` headers
✅ **Logging** - Comprehensive logging of violations and errors
✅ **Development Mode** - Optional testing in development
✅ **Graceful Error Handling** - Doesn't break app if rate limiter fails
✅ **Human-Readable Messages** - User-friendly error messages with time remaining

---

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Enable rate limiting in development (optional, default: false)
ENABLE_RATE_LIMIT_IN_DEV=false


# Comma-separated list of whitelisted IPs (optional)
RATE_LIMIT_WHITELIST_IPS=192.168.1.100,10.0.0.50
```

### Default Whitelisted IPs

The following IPs are always whitelisted:

- `127.0.0.1` (localhost IPv4)
- `::1` (localhost IPv6)
- `::ffff:127.0.0.1` (localhost IPv4-mapped IPv6)

---

## Current Configuration

All endpoints are currently configured with:

- **1 request per 5 seconds** per IP address
- **Active only in PRODUCTION mode** (unless `ENABLE_RATE_LIMIT_IN_DEV=true`)

### Protected Endpoints

| Endpoint                                        | Key Prefix            | Limit    | Notes                   |
| ----------------------------------------------- | --------------------- | -------- | ----------------------- |
| `/project-request/create`                       | `project_request`     | 1 req/5s | Project creation        |
| `/newsletter/sendNewsLetterToSingleSubscriber`  | `newsletter`          | 1 req/5s | Admin only              |
| `/hire-us/createHireUsRequest`                  | `hire_us`             | 1 req/5s | Public form             |
| `/quote/createQuote`                            | `quote`               | 1 req/5s | Public form             |
| `/freelancer/getFreeLancerJoinUsRequest`        | `freelancer_join`     | 1 req/5s | Freelancer join         |
| `/freelancer/register`                          | `freelancer_register` | 1 req/5s | Freelancer registration |
| `/contact-us/createMessage`                     | `contact_us`          | 1 req/5s | Public form             |
| `/consultation/requestAConsultation`            | `consultation_create` | 1 req/5s | Consultation request    |
| `/consultation/updateRequestedConsultation/:id` | `consultation_update` | 1 req/5s | Update consultation     |

---

## Usage

### Basic Usage in Router

```typescript
import rateLimiterMiddleware from "../../middlewares/rateLimiterMiddleware";

router.route("/endpoint").post(
  (req, res, next) =>
    rateLimiterMiddleware.handle(
      req,
      res,
      next,
      consumptionPoints, // How many points this request consumes (default: 1)
      message, // Custom error message (optional)
      totalPoints, // Total points allowed (default: 10)
      duration, // Time window in seconds (default: 60)
      keyPrefix, // Unique key for this endpoint (default: "global")
    ),
  controllerFunction,
);
```

### Example: Strict Rate Limit (1 req/5s)

```typescript
router
  .route("/submit-form")
  .post(
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        undefined,
        1,
        5,
        "form_submit",
      ),
    controller.submitForm,
  );
```

### Example: Moderate Rate Limit (10 req/min)

```typescript
router
  .route("/api/data")
  .get(
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        undefined,
        10,
        60,
        "data_api",
      ),
    controller.getData,
  );
```

### Example: Heavy Operation (1 req/hour)

```typescript
router
  .route("/api/heavy")
  .post(
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Only 1 request per hour allowed",
        1,
        3600,
        "heavy_op",
      ),
    controller.heavyOperation,
  );
```

### Using Preset Configurations

```typescript
import { ENDPOINT_RATE_LIMITS } from "../../config/rateLimiterConfig";

const config = ENDPOINT_RATE_LIMITS.CONTACT_US;

router
  .route("/contact")
  .post(
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        config.consumptionPoints,
        config.message,
        config.totalPoints,
        config.duration,
        config.keyPrefix,
      ),
    controller.submitContact,
  );
```

---

## Rate Limit Headers

The middleware sets the following standard headers on every response:

```
X-RateLimit-Limit: 10           # Maximum requests allowed
X-RateLimit-Remaining: 7        # Requests remaining in window
X-RateLimit-Reset: 1698765432   # Unix timestamp when limit resets
Retry-After: 45                 # Seconds to wait (set on 429 errors)
```

---

## Error Response

When rate limit is exceeded (429 Too Many Requests):

```json
{
  "success": false,
  "status": 429,
  "message": "Too Many Requests. Please try again after 4 seconds",
  "data": null,
  "requestInfo": {
    "url": "/api/v1/contact-us/createMessage",
    "ip": "192.168.1.100",
    "method": "POST"
  }
}
```

---

## Key Prefixes (Endpoint Isolation)

Each endpoint should have a unique `keyPrefix`. This ensures:

- Rate limits don't interfere between different endpoints
- Users can use multiple services without hitting a global limit
- Better security and user experience

**Example:**

- User submits a contact form: consumes `contact_us` points
- Same user requests a quote: consumes `quote` points (separate)
- Both actions can happen within the same time window

---

## Whitelist Management

### Add IPs Programmatically

```typescript
import rateLimiterMiddleware from "./middlewares/rateLimiterMiddleware";

// Add trusted IPs
rateLimiterMiddleware.addToWhitelist(["203.0.113.0", "198.51.100.0"]);
```

### Via Environment Variable

```env
RATE_LIMIT_WHITELIST_IPS=203.0.113.0,198.51.100.0,192.0.2.0
```

---

## Testing in Development

By default, rate limiting is disabled in development mode. To enable for testing:

### Method 1: Environment Variable

```env
ENABLE_RATE_LIMIT_IN_DEV=true
```

### Method 2: Programmatically

```typescript
import rateLimiterMiddleware from "./middlewares/rateLimiterMiddleware";

rateLimiterMiddleware.enableTestMode();
```

---

## Logging

The rate limiter logs the following events:

### Initialization

```
Rate limiter initialized with 2 whitelisted IPs
Rate limiter initialized: quote_1_5 (1 requests per 5s)
```

### Rate Limit Exceeded

```
Rate limit exceeded - IP: 192.168.1.100, Endpoint: /api/v1/quote/createQuote, Retry after: 3 seconds
```

### Approaching Limit (< 20% remaining)

```
IP 192.168.1.100 approaching rate limit: 2 points remaining
```

### Whitelisted IP Bypass

```
Whitelisted IP bypassed rate limit: 127.0.0.1
```

### Errors

```
Rate limiter error: Database connection failed
Unable to determine client IP address for rate limiting
```

---

## Database

Rate limit data is stored in the `RateLimiterFlexible` table:

```prisma
model RateLimiterFlexible {
 key    String    @id      // Format: {keyPrefix}_{ip}
 points Int                // Remaining points
 expire DateTime?          // When points reset
}
```

### Example Records

| key                        | points | expire              |
| -------------------------- | ------ | ------------------- |
| `contact_us_192.168.1.100` | 0      | 2024-01-15 10:30:45 |
| `quote_10.0.0.50`          | 8      | 2024-01-15 10:31:00 |

---

## Advanced Features

### Create Reusable Middleware

```typescript
// Create a preset middleware function
const strictLimiter = rateLimiterMiddleware.createLimiter(
  1, // consumptionPoints
  1, // totalPoints
  5, // duration
  "strict", // keyPrefix
  "Rate limit: 1 request per 5 seconds",
);

// Use it in routes
router.route("/endpoint1").post(strictLimiter, controller1);
router.route("/endpoint2").post(strictLimiter, controller2);
```

### Clear All Rate Limiters (Testing)

```typescript
rateLimiterMiddleware.clearAll();
```

---

## Troubleshooting

### Issue: Rate limiting not working in development

**Solution:** Set `ENABLE_RATE_LIMIT_IN_DEV=true` in `.env`

### Issue: All endpoints sharing the same limit

**Solution:** Ensure each endpoint has a unique `keyPrefix`

### Issue: Legitimate users getting blocked

**Solutions:**

1. Add their IP to whitelist
2. Increase rate limits for that endpoint
3. Implement user-based rate limiting (authenticated users get higher limits)

### Issue: Rate limiter causing 500 errors

**Solution:** Check database connection. The middleware fails gracefully but logs errors.

### Issue: Can't identify user IP behind proxy

**Solution:** Ensure `app.set('trust proxy', 1)` is set in `app.ts`

---

## Security Best Practices

1. ✅ **Always use keyPrefix** - Don't use "global" for everything
2. ✅ **Different limits for different endpoints** - Strict for forms, lenient for reads
3. ✅ **Monitor logs** - Watch for abuse patterns
4. ✅ **Whitelist carefully** - Only trusted IPs
5. ✅ **Test in staging** - Enable in dev/staging before production
6. ✅ **Set appropriate messages** - Help users understand limits
7. ✅ **Use HTTPS** - Prevent IP spoofing

---

## Performance

The rate limiter is highly performant:

- Database queries are optimized
- Multiple configurations are cached in memory
- Minimal overhead per request (~2-5ms)

---

## Future Enhancements

Potential improvements for future versions:

- [ ] User-based rate limiting (different limits for authenticated users)
- [ ] Redis support for distributed systems
- [ ] Dynamic limits based on user tier/subscription
- [ ] Rate limit analytics dashboard
- [ ] Automatic IP blacklisting after repeated violations
- [ ] Burst allowance (allow temporary spikes)
- [ ] Geographic-based limits

---

## Support

For issues or questions:

1. Check logs in `logs/application-{date}.log`
2. Review this documentation
3. Check database records in `RateLimiterFlexible` table
4. Enable debug logging: `logger.level = 'debug'`

---

**Last Updated:** October 21, 2025
