# PRISMA SEED SCRIPT GUIDE - `seed-pricing.ts`

## 📚 **What is a Seed Script?**

A **seed script** is a file that populates your database with **initial/default data** that your application needs to function properly. In this case, `seed-pricing.ts` seeds pricing data for:

- **Service Categories** (e.g., SOFTWARE_DEVELOPMENT, DATA_AND_ANALYTICS)
- **Technologies** (e.g., React, Node.js, AWS)
- **Features** (e.g., User Authentication, Payment Gateway)

This data is used to calculate project cost estimates when visitors or clients fill out project details.

---

## 🔧 **How the Seed Script Works**

### **1. Script Structure**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding pricing data...");

  // Insert service categories
  for (const category of serviceCategories) {
    await prisma.pricingServiceCategory.upsert({
      where: { category: category.category },
      update: {
        basePrice: category.basePrice,
        description: category.description,
      },
      create: category,
    });
  }

  // Insert technologies
  // Insert features
  // ...
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### **2. Key Concepts**

#### **`upsert()` Method**

The script uses `upsert()` which means:

- **UPDATE** if the record exists
- **INSERT** if the record doesn't exist

This makes the seed script **idempotent** (safe to run multiple times).

Example:

```typescript
await prisma.pricingServiceCategory.upsert({
  where: { category: "SOFTWARE_DEVELOPMENT" }, // Find by this
  update: { basePrice: 5000 }, // Update if found
  create: { category: "SOFTWARE_DEVELOPMENT", basePrice: 5000 }, // Create if not found
});
```

#### **Data Being Seeded**

**Service Categories (6 items):**

- SOFTWARE_DEVELOPMENT → $5,000 base
- DATA_AND_ANALYTICS → $4,000 base
- CLOUD_AND_DEVOPS → $3,500 base
- EMERGING_TECHNOLOGIES → $6,000 base
- CREATIVE_AND_DESIGN → $2,500 base
- DIGITAL_MARKETING → $2,000 base

**Technologies (24 items):**

- React → +$500
- Angular → +$600
- AWS → +$800
- Kubernetes → +$900
- TensorFlow → +$1,200
- etc.

**Features (30 items):**

- User Authentication → +$800
- Payment Gateway → +$1,200
- Real-time Chat → +$1,500
- Admin Panel → +$1,800
- CMS → +$2,000
- etc.

---

## 🚀 **How to Execute the Seed Script**

I've added two ways to run the seed script to your `package.json`:

### **Method 1: Using npm/bun script (Recommended)**

```bash
cd /Users/ssingh83/Desktop/MONDAYTARGET/PLS-Backend
bun run db:seed
```

**Output you'll see:**

```
Seeding pricing data...
✓ Seeded 6 service categories
✓ Seeded 24 technologies
✓ Seeded 30 features
✅ Pricing data seeding completed!
```

### **Method 2: Using Prisma CLI (Auto-runs after migrations)**

```bash
bunx prisma db seed
```

This command is useful because Prisma can automatically run it after migrations if configured (which I've done).

### **Method 3: Direct execution**

```bash
bun run prisma/seed-pricing.ts
```

---

## 📋 **When to Run the Seed Script**

### **1. Fresh Database Setup**

After creating a new database or running migrations:

```bash
bun run db:migrate    # Run migrations
bun run db:seed       # Seed data
```

### **2. After Database Reset**

If you reset/clear your database:

```bash
bunx prisma migrate reset  # This will automatically run seed if configured
# OR manually:
bun run db:seed
```

### **3. Update Pricing Data**

If you modify prices in `seed-pricing.ts` and want to update:

```bash
bun run db:seed  # Will update existing records with new prices
```

---

## 🔍 **How the Pricing Data is Used**

### **In Your Application:**

When a visitor/client creates a project, the system:

1. **Selects service category** → Gets base price

   ```
   SOFTWARE_DEVELOPMENT = $5,000 base
   ```

2. **Selects technologies** → Adds costs

   ```
   React (+$500) + Node.js (+$600) + AWS (+$800) = +$1,900
   ```

3. **Selects features** → Adds costs

   ```
   User Auth (+$800) + Payment Gateway (+$1,200) = +$2,000
   ```

4. **Calculates total estimate**
   ```
   Base: $5,000
   Tech: +$1,900
   Features: +$2,000
   ─────────────────
   Total: $8,900
   ```

### **Database Tables Used:**

The seed script populates these Prisma models:

- `PricingServiceCategory`
- `PricingTechnology`
- `PricingFeature`

You can view the data after seeding:

```bash
bun run db:studio  # Opens Prisma Studio GUI
```

---

## 🛠️ **Modifying the Seed Data**

### **To Change Prices:**

1. Edit `prisma/seed-pricing.ts`:

```typescript
const serviceCategories = [
  {
    category: "SOFTWARE_DEVELOPMENT",
    basePrice: 7000, // Changed from 5000 to 7000
    description: "Base price for software development services",
  },
  // ...
];
```

2. Run the seed script again:

```bash
bun run db:seed
```

Since we're using `upsert()`, it will **update** the existing records with new prices!

### **To Add New Items:**

Just add to the arrays in `seed-pricing.ts`:

```typescript
const technologies = [
  // ... existing technologies
  { technology: "Svelte", additionalCost: 500 },
  { technology: "Solid.js", additionalCost: 450 },
];
```

Then run:

```bash
bun run db:seed
```

---

## ✅ **Verify Seeding Worked**

### **Method 1: Prisma Studio (Visual)**

```bash
bun run db:studio
```

Navigate to `PricingServiceCategory`, `PricingTechnology`, `PricingFeature` tables.

### **Method 2: Direct Query**

```bash
bunx prisma db execute --stdin < query.sql
```

Or in your application code:

```typescript
const categories = await prisma.pricingServiceCategory.findMany();
console.log(categories); // Should show all 6 categories
```

### **Method 3: Check counts**

Create a simple test file `test-seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const categoryCount = await prisma.pricingServiceCategory.count();
  const techCount = await prisma.pricingTechnology.count();
  const featureCount = await prisma.pricingFeature.count();

  console.log(`Categories: ${categoryCount} (expected 6)`);
  console.log(`Technologies: ${techCount} (expected 24)`);
  console.log(`Features: ${featureCount} (expected 30)`);
}

check();
```

Run it:

```bash
bun run test-seed.ts
```

---

## 🔄 **Automatic Seeding with Migrations**

With the configuration I added to `package.json`:

```json
"prisma": {
  "seed": "bun run prisma/seed-pricing.ts"
}
```

Now, when you run:

```bash
bunx prisma migrate dev
```

Prisma will **automatically run the seed script** after applying migrations!

---

## 📦 **Configuration Added**

I've added to your `package.json`:

```json
{
  "scripts": {
    "db:seed": "bun run prisma/seed-pricing.ts"
  },
  "prisma": {
    "seed": "bun run prisma/seed-pricing.ts"
  }
}
```

**Benefits:**

1. ✅ Easy to run: `bun run db:seed`
2. ✅ Auto-runs after `prisma migrate dev`
3. ✅ Auto-runs after `prisma migrate reset`
4. ✅ Consistent with other db commands

---

## 🎯 **Quick Commands Summary**

```bash
# Seed the database
bun run db:seed

# View seeded data (GUI)
bun run db:studio

# Reset database and re-seed
bunx prisma migrate reset  # Asks confirmation, then auto-seeds

# Run migrations (auto-seeds after)
bun run db:migrate
```

---

## 💡 **Common Use Cases**

### **Case 1: First Time Setup**

```bash
git clone <repo>
cd PLS-Backend
bun install
bun run db:migrate  # Creates tables and auto-seeds
bun run dev         # Start server with pricing data ready
```

### **Case 2: Update Prices**

```bash
# Edit prisma/seed-pricing.ts
bun run db:seed  # Updates all prices
```

### **Case 3: Fresh Start**

```bash
bunx prisma migrate reset  # Drops DB, runs migrations, auto-seeds
bun run dev
```

---

## 🚨 **Important Notes**

1. **Safe to Run Multiple Times**: Uses `upsert()`, won't create duplicates
2. **Updates Existing Data**: If prices change, running seed again updates them
3. **No Migration Needed**: Seed scripts don't modify schema, only data
4. **Environment**: Make sure `.env` has correct `DATABASE_URL`

---

## 🎉 **You're All Set!**

Run this now to seed your database:

```bash
cd /Users/ssingh83/Desktop/MONDAYTARGET/PLS-Backend
bun run db:seed
```

You should see:

```
Seeding pricing data...
✓ Seeded 6 service categories
✓ Seeded 24 technologies
✓ Seeded 30 features
✅ Pricing data seeding completed!
```

Then verify in Prisma Studio:

```bash
bun run db:studio
```
