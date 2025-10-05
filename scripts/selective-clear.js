// Selective data clearing script
// Run with: node scripts/selective-clear.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function clearData() {
  try {
    console.log("🗑️  Starting selective data clearing...");

    // Clear all data except admin users
    await prisma.payment.deleteMany();
    console.log("✅ Cleared Payment data");

    await prisma.visitors.deleteMany();
    console.log("✅ Cleared Visitors data");

    await prisma.projectBuilder.deleteMany();
    console.log("✅ Cleared ProjectBuilder data");

    await prisma.milestone.deleteMany();
    console.log("✅ Cleared Milestone data");

    await prisma.project.deleteMany();
    console.log("✅ Cleared Project data");

    // Clear freelancer-related data
    await prisma.freeLancersRequest.deleteMany();
    console.log("✅ Cleared FreeLancersRequest data");

    await prisma.hireUs.deleteMany();
    console.log("✅ Cleared HireUs data");

    await prisma.consultationBooking.deleteMany();
    console.log("✅ Cleared ConsultationBooking data");

    await prisma.getQuote.deleteMany();
    console.log("✅ Cleared GetQuote data");

    await prisma.contactUs.deleteMany();
    console.log("✅ Cleared ContactUs data");

    await prisma.newsletter.deleteMany();
    console.log("✅ Cleared Newsletter data");

    await prisma.blogPost.deleteMany();
    console.log("✅ Cleared BlogPost data");

    // Clear user data (except admin users)
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    await prisma.user.deleteMany({
      where: { role: { not: "ADMIN" } },
    });
    console.log("✅ Cleared non-admin User data");

    // Clear rate limiter data
    await prisma.rateLimiterFlexible.deleteMany();
    console.log("✅ Cleared RateLimiter data");

    console.log("🎉 Data clearing completed successfully!");
    console.log(`📊 Kept ${adminUsers.length} admin users`);
  } catch (error) {
    console.error("❌ Error clearing data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
