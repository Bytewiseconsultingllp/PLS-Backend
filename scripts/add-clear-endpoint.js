// Example of how to add a clear data endpoint to your API
// This would go in your controllers

const clearAllData = async (req, res) => {
  try {
    // Only allow in development
    if (process.env.ENV !== "DEVELOPMENT") {
      return res.status(403).json({
        success: false,
        message: "This endpoint is only available in development",
      });
    }

    // Clear all data
    await prisma.payment.deleteMany();
    await prisma.visitors.deleteMany();
    await prisma.projectBuilder.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    await prisma.freeLancersRequest.deleteMany();
    await prisma.hireUs.deleteMany();
    await prisma.consultationBooking.deleteMany();
    await prisma.getQuote.deleteMany();
    await prisma.contactUs.deleteMany();
    await prisma.newsletter.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.user.deleteMany();
    await prisma.rateLimiterFlexible.deleteMany();

    res.json({
      success: true,
      message: "All data cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing data",
      error: error.message,
    });
  }
};

// Add this to your router:
// router.post('/clear-data', authMiddleware.checkToken, clearAllData);
