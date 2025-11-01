# KPI SYSTEM - QUICK REFERENCE

## 🎯 KPI Ranks

| Rank      | Points    |
| --------- | --------- |
| BRONZE    | < 50      |
| SILVER    | 50-199    |
| GOLD      | 200-499   |
| PLATINIUM | 500-999   |
| DIAMOND   | 1000-1999 |
| CROWN     | 2000-4999 |
| ACE       | 5000-9999 |
| CONQUERER | 10000+    |

## 📡 API Endpoints

### Admin (Any Freelancer)

```
POST /api/v1/admin/freelancers/:freelancerId/kpi
Authorization: Bearer {admin_token}

Body:
{
  "points": 50,
  "note": "Reason for points"
}
```

### Moderator (Assigned Projects Only)

```
POST /api/v1/moderator-kpi/freelancers/:freelancerId/kpi
Authorization: Bearer {moderator_token}

Body:
{
  "points": 30,
  "note": "Reason for points",
  "projectId": "uuid-here"
}
```

### Client (Their Projects Only)

```
POST /api/v1/client-kpi/freelancers/:freelancerId/kpi
Authorization: Bearer {client_token}

Body:
{
  "points": 75,
  "note": "Reason for points",
  "projectId": "uuid-here"
}
```

### View KPI (Public)

```
GET /api/v1/freelancers/:freelancerId/kpi
```

### View History (Authenticated)

```
GET /api/v1/freelancers/:freelancerId/kpi-history?limit=50
Authorization: Bearer {token}
```

### Leaderboard (Public)

```
GET /api/v1/freelancers/leaderboard?page=1&limit=20
```

## 🔒 Authorization Rules

| Role      | Can Assign To                    | Requires projectId |
| --------- | -------------------------------- | ------------------ |
| Admin     | Anyone                           | No                 |
| Moderator | Freelancers on assigned projects | Yes                |
| Client    | Freelancers on their projects    | Yes                |

## 📝 Validation Rules

- **points**: Integer, cannot be zero (positive = reward, negative = penalty)
- **note**: String, 5-500 characters, explains the reason
- **projectId**: UUID (optional for Admin, required for Moderator/Client)

## 💡 Common Use Cases

### Reward

```json
{
  "points": 50,
  "note": "Excellent work, delivered ahead of schedule"
}
```

### Penalty

```json
{
  "points": -20,
  "note": "Missed deadline by 3 days"
}
```

### Big Bonus

```json
{
  "points": 100,
  "note": "Client extremely satisfied, 5-star review"
}
```

## 📊 KPI in Bid Listings

When viewing bids, KPI data is automatically included:

```json
{
  "freelancer": {
    "user": {
      "kpiRankPoints": 150,
      "kpiRank": "SILVER"
    }
  }
}
```

## 🚀 Quick Test

1. Start server: `bun run dev`
2. Go to: http://localhost:8000/api-docs
3. Find section: `KPI - Admin` or `KPI - Public`
4. Try the leaderboard endpoint first (no auth needed)
5. Then try assigning points (needs auth)

## 📁 Key Files

- Service: `src/services/kpiService.ts`
- Controller: `src/controllers/kpiController/kpiController.ts`
- Router: `src/routers/kpiRouter/kpiRouter.ts`
- Swagger: `src/swagger/kpi.yaml`
- Validation: `src/validation/zod.ts` (assignKPIPointsSchema)
