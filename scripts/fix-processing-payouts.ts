import { PrismaClient } from "@prisma/client";
import StripeService from "../src/services/stripeService";

const prisma = new PrismaClient();

async function fixProcessingPayouts() {
  console.log("🔍 Searching for payouts stuck in PROCESSING status...\n");

  // Find all PROCESSING payouts
  const processingPayouts = await prisma.freelancerPayout.findMany({
    where: { status: "PROCESSING" },
    include: {
      freelancer: {
        include: {
          details: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  console.log(
    `Found ${processingPayouts.length} payout(s) in PROCESSING status\n`,
  );

  if (processingPayouts.length === 0) {
    console.log("✅ No payouts need fixing!");
    await prisma.$disconnect();
    return;
  }

  for (const payout of processingPayouts) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📋 Payout ID: ${payout.id}`);
    console.log(
      `   Freelancer: ${payout.freelancer.details?.fullName || "Unknown"}`,
    );
    console.log(
      `   Amount: ${payout.amount.toString()} ${payout.currency.toUpperCase()}`,
    );
    console.log(`   Created: ${payout.createdAt.toISOString()}`);
    console.log(`   Stripe Transfer ID: ${payout.stripeTransferId || "N/A"}`);

    if (!payout.stripeTransferId) {
      console.log("   ⚠️  Skipping - no Stripe transfer ID");
      continue;
    }

    try {
      // Check transfer status in Stripe
      const transfer = await StripeService.getTransfer(payout.stripeTransferId);

      console.log(`   Stripe Status:`);
      console.log(`     - Reversed: ${transfer.reversed}`);
      console.log(
        `     - Amount: ${transfer.amount / 100} ${transfer.currency.toUpperCase()}`,
      );
      console.log(
        `     - Destination: ${typeof transfer.destination === "string" ? transfer.destination : "N/A"}`,
      );

      if (transfer.reversed) {
        // Transfer was reversed
        await prisma.freelancerPayout.update({
          where: { id: payout.id },
          data: {
            status: "CANCELLED",
            failureReason: "Transfer was reversed",
            notes: `${payout.notes || ""}\n\nAutomatically updated by fix-processing-payouts script`,
          },
        });
        console.log(`   ✅ Updated to CANCELLED (transfer was reversed)`);
      } else {
        // Transfer is successful (not reversed means it went through)
        await prisma.freelancerPayout.update({
          where: { id: payout.id },
          data: {
            status: "PAID",
            paidAt: new Date(transfer.created * 1000), // Convert Unix timestamp
          },
        });
        console.log(`   ✅ Updated to PAID`);
      }
    } catch (error) {
      console.error(
        `   ❌ Error checking payout:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("\n✨ Done! All payouts processed.");
  await prisma.$disconnect();
}

// Run the script
fixProcessingPayouts().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
