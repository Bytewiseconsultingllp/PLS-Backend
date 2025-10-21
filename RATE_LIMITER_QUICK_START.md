# Rate Limiter - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Add Environment Variables (Optional)

```env
# .env file
ENABLE_RATE_LIMIT_IN_DEV=false
RATE_LIMIT_WHITELIST_IPS=192.168.1.100,10.0.0.50
```

### 2. Use in Router

```typescript
import rateLimiterMiddleware from "../../middlewares/rateLimiterMiddleware";

router.post(
  "/your-endpoint",
  (req, res, next) =>
    rateLimiterMiddleware.handle(
      req,
      res,
      next,
      1, // points per request
      undefined, // custom message (optional)
      1, // total points allowed
      5, // time window (seconds)
      "your_key", // unique key prefix
    ),
  yourController.yourMethod,
);
```

---

## 📋 Common Configurations

### Very Strict (1 request per 5 seconds)

```typescript
rateLimiterMiddleware.handle(req, res, next, 1, undefined, 1, 5, "key");
```

### Strict (1 request per second)

```typescript
rateLimiterMiddleware.handle(req, res, next, 1, undefined, 1, 1, "key");
```

### Moderate (10 requests per minute)

```typescript
rateLimiterMiddleware.handle(req, res, next, 1, undefined, 10, 60, "key");
```

### Lenient (30 requests per minute)

```typescript
rateLimiterMiddleware.handle(req, res, next, 1, undefined, 30, 60, "key");
```

### Heavy Operation (1 per hour)

```typescript
rateLimiterMiddleware.handle(
  req,
  res,
  next,
  1,
  "Only once per hour",
  1,
  3600,
  "key",
);
```

---

## 🔑 Key Prefixes

**IMPORTANT:** Each endpoint MUST have a unique key prefix!

✅ **Good:**

```typescript
// Contact form
rateLimiterMiddleware.handle(req, res, next, 1, undefined, 1, 5, "contact_us");

// Quote form
rateLimiterMiddleware.handle(req, res, next, 1, undefined, 1, 5, "quote");
```

❌ **Bad:**

```typescript
// Both using "global" - they'll interfere with each other!
rateLimiterMiddleware.handle(req, res, next, 1, undefined, 1, 5, "global");
rateLimiterMiddleware.handle(req, res, next, 1, undefined, 1, 5, "global");
```

---

## 🎯 Current Endpoints

All currently protected:

| Route                      | Key                   | Config |
| -------------------------- | --------------------- | ------ |
| `/project-request/create`  | `project_request`     | 1/5s   |
| `/newsletter/send`         | `newsletter`          | 1/5s   |
| `/hire-us/create`          | `hire_us`             | 1/5s   |
| `/quote/create`            | `quote`               | 1/5s   |
| `/freelancer/join`         | `freelancer_join`     | 1/5s   |
| `/freelancer/register`     | `freelancer_register` | 1/5s   |
| `/contact-us/create`       | `contact_us`          | 1/5s   |
| `/consultation/create`     | `consultation_create` | 1/5s   |
| `/consultation/update/:id` | `consultation_update` | 1/5s   |

---

## 🧪 Testing in Development

By default, rate limiting is OFF in development.

### Enable for testing:

**Method 1 - Environment Variable:**

```env
ENABLE_RATE_LIMIT_IN_DEV=true
```

**Method 2 - Programmatically:**

```typescript
import rateLimiterMiddleware from "./middlewares/rateLimiterMiddleware";

rateLimiterMiddleware.enableTestMode();
```

---

## 🛡️ Whitelist IPs

### Via Environment Variable:

```env
RATE_LIMIT_WHITELIST_IPS=192.168.1.100,10.0.0.50,203.0.113.0
```

### Programmatically:

```typescript
rateLimiterMiddleware.addToWhitelist(["192.168.1.100", "10.0.0.50"]);
```

**Default Whitelisted:**

- `127.0.0.1`
- `::1`
- `::ffff:127.0.0.1`

---

## 📊 Response Headers

Every request includes:

```
X-RateLimit-Limit: 1
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1698765437
Retry-After: 5
```

---

## ⚠️ Error Response (429)

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

## 🔍 Monitoring

Check logs at: `logs/application-{date}.log`

Look for:

- `Rate limit exceeded` - Violations
- `Rate limiter initialized` - Setup confirmation
- `approaching rate limit` - Warning signs
- `Whitelisted IP bypassed` - Whitelist usage

---

## 🆘 Troubleshooting

| Problem                  | Solution                            |
| ------------------------ | ----------------------------------- |
| Not working in dev       | Set `ENABLE_RATE_LIMIT_IN_DEV=true` |
| Endpoints sharing limits | Use unique `keyPrefix` for each     |
| Users blocked unfairly   | Add IP to whitelist                 |
| 500 errors               | Check database connection           |
| Can't find user IP       | Ensure `app.set('trust proxy', 1)`  |

---

## 📚 Full Documentation

For complete details, see:

- **`RATE_LIMITER_DOCUMENTATION.md`** - Full usage guide
- **`RATE_LIMITER_CHANGES_SUMMARY.md`** - What changed
- **`src/config/rateLimiterConfig.ts`** - Configuration file

---

## ✅ Checklist for New Endpoints

When adding rate limiting to a new endpoint:

- [ ] Import `rateLimiterMiddleware`
- [ ] Choose appropriate limits (points, duration)
- [ ] Create **unique** key prefix
- [ ] Add rate limiter to route chain
- [ ] Test in development (with `ENABLE_RATE_LIMIT_IN_DEV=true`)
- [ ] Verify headers are returned
- [ ] Test rate limit is enforced
- [ ] Check logs for violations
- [ ] Document in your API docs

---

## 💡 Pro Tips

1. **Always use unique key prefixes** - Don't use "global"
2. **Test before deploying** - Enable in dev first
3. **Monitor logs** - Watch for abuse patterns
4. **Adjust as needed** - Start strict, relax if needed
5. **Document for frontend** - Share limits with your team
6. **Use preset configs** - Check `rateLimiterConfig.ts`

---

## 🎉 You're Ready!

The rate limiter is now protecting your API. Users get clear error messages, your server is protected, and you have full control.

**Questions?** Check the full documentation or logs!

---

**Version:** 2.0
**Last Updated:** October 21, 2025
