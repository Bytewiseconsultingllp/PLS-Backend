import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding pricing data...");

  // Service Category Base Prices
  const serviceCategories = [
    {
      category: "SOFTWARE_DEVELOPMENT",
      basePrice: 5000,
      description:
        "Base price for software development services (web, mobile, APIs)",
    },
    {
      category: "DATA_AND_ANALYTICS",
      basePrice: 4000,
      description: "Base price for data and analytics services",
    },
    {
      category: "CLOUD_AND_DEVOPS",
      basePrice: 3500,
      description: "Base price for cloud and DevOps services",
    },
    {
      category: "EMERGING_TECHNOLOGIES",
      basePrice: 6000,
      description: "Base price for emerging tech (AI/ML, Blockchain, IoT)",
    },
    {
      category: "CREATIVE_AND_DESIGN",
      basePrice: 2500,
      description: "Base price for creative and design services",
    },
    {
      category: "DIGITAL_MARKETING",
      basePrice: 2000,
      description: "Base price for digital marketing services",
    },
  ];

  for (const category of serviceCategories) {
    await prisma.pricingServiceCategory.upsert({
      where: { category: category.category as any },
      update: {
        basePrice: category.basePrice,
        description: category.description,
      },
      create: category as any,
    });
  }

  console.log(`✓ Seeded ${serviceCategories.length} service categories`);

  // Technology Additional Costs
  const technologies = [
    { technology: "React", additionalCost: 500 },
    { technology: "Angular", additionalCost: 600 },
    { technology: "Vue.js", additionalCost: 500 },
    { technology: "Next.js", additionalCost: 700 },
    { technology: "Node.js", additionalCost: 600 },
    { technology: "Python", additionalCost: 500 },
    { technology: "Django", additionalCost: 700 },
    { technology: "FastAPI", additionalCost: 650 },
    { technology: "PostgreSQL", additionalCost: 400 },
    { technology: "MongoDB", additionalCost: 400 },
    { technology: "MySQL", additionalCost: 350 },
    { technology: "Redis", additionalCost: 300 },
    { technology: "AWS", additionalCost: 800 },
    { technology: "Azure", additionalCost: 800 },
    { technology: "Google Cloud", additionalCost: 800 },
    { technology: "Docker", additionalCost: 500 },
    { technology: "Kubernetes", additionalCost: 900 },
    { technology: "TensorFlow", additionalCost: 1200 },
    { technology: "PyTorch", additionalCost: 1200 },
    { technology: "GraphQL", additionalCost: 600 },
    { technology: "REST API", additionalCost: 400 },
    { technology: "Microservices", additionalCost: 1000 },
    { technology: "React Native", additionalCost: 800 },
    { technology: "Flutter", additionalCost: 800 },
    { technology: "Swift", additionalCost: 900 },
    { technology: "Kotlin", additionalCost: 900 },
  ];

  for (const tech of technologies) {
    await prisma.pricingTechnology.upsert({
      where: { technology: tech.technology },
      update: { additionalCost: tech.additionalCost },
      create: tech,
    });
  }

  console.log(`✓ Seeded ${technologies.length} technologies`);

  // Feature Additional Costs
  const features = [
    { feature: "User Authentication", additionalCost: 800 },
    { feature: "Role-Based Access Control", additionalCost: 600 },
    { feature: "Two-Factor Authentication", additionalCost: 500 },
    { feature: "OAuth Integration", additionalCost: 700 },
    { feature: "Payment Gateway Integration", additionalCost: 1200 },
    { feature: "Real-time Chat", additionalCost: 1500 },
    { feature: "Push Notifications", additionalCost: 600 },
    { feature: "Email Notifications", additionalCost: 400 },
    { feature: "File Upload/Storage", additionalCost: 500 },
    { feature: "Search Functionality", additionalCost: 700 },
    { feature: "Advanced Filtering", additionalCost: 600 },
    { feature: "Data Export (CSV/PDF)", additionalCost: 400 },
    { feature: "Analytics Dashboard", additionalCost: 1500 },
    { feature: "Reporting System", additionalCost: 1200 },
    { feature: "Multi-language Support", additionalCost: 800 },
    { feature: "Dark Mode", additionalCost: 300 },
    { feature: "Responsive Design", additionalCost: 600 },
    { feature: "API Documentation", additionalCost: 500 },
    { feature: "Admin Panel", additionalCost: 1800 },
    { feature: "Content Management System", additionalCost: 2000 },
    { feature: "Social Media Integration", additionalCost: 600 },
    { feature: "GPS/Location Services", additionalCost: 800 },
    { feature: "Video Streaming", additionalCost: 1500 },
    { feature: "Live Audio/Video Call", additionalCost: 2000 },
    { feature: "Booking/Scheduling System", additionalCost: 1200 },
    { feature: "Calendar Integration", additionalCost: 700 },
    { feature: "E-commerce Cart", additionalCost: 1000 },
    { feature: "Product Catalog", additionalCost: 800 },
    { feature: "Order Management", additionalCost: 1200 },
    { feature: "Inventory Management", additionalCost: 1500 },
  ];

  for (const feature of features) {
    await prisma.pricingFeature.upsert({
      where: { feature: feature.feature },
      update: { additionalCost: feature.additionalCost },
      create: feature,
    });
  }

  console.log(`✓ Seeded ${features.length} features`);
  console.log("✅ Pricing data seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding pricing data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
