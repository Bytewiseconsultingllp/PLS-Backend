const { sendOTP } = require("./dist/src/services/sendOTPService");
const {
  generateOtp,
} = require("./dist/src/services/slugStringGeneratorService");
const { gloabalMailMessage } = require("./dist/src/services/globalMailService");
const nodemailer = require("nodemailer");

// Mock nodemailer for testing
const mockTransporter = {
  sendMail: async () => ({
    response: "Email sent successfully",
    messageId: "test-message-id",
  }),
};

// Mock the createTransporter method
nodemailer.createTransporter = () => mockTransporter;

async function testOTPGeneration() {
  console.log("🧪 Testing OTP Generation...");

  try {
    const { otp, otpExpiry } = generateOtp();

    console.log(`✅ Generated OTP: ${otp}`);
    console.log(`✅ OTP Expiry: ${otpExpiry}`);

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      throw new Error("OTP should be 6 digits");
    }

    // Validate expiry time (should be approximately 30 minutes from now)
    const expectedExpiry = new Date(Date.now() + 30 * 60 * 1000);
    const timeDifference = Math.abs(
      otpExpiry.getTime() - expectedExpiry.getTime(),
    );

    if (timeDifference > 1000) {
      // Allow 1 second tolerance
      throw new Error("OTP expiry time is not correct");
    }

    console.log("✅ OTP generation test passed!");
    return { otp, otpExpiry };
  } catch (error) {
    console.error("❌ OTP generation test failed:", error.message);
    throw error;
  }
}

async function testOTPService() {
  console.log("🧪 Testing OTP Service...");

  try {
    const testEmail = "test@example.com";
    const testOTP = "123456";
    const testName = "Test User";
    const testMessage = "This is a test OTP message";

    // Test the sendOTP function
    await sendOTP(testEmail, testOTP, testName, testMessage);

    console.log("✅ OTP service test passed!");
    console.log(`✅ Email would be sent to: ${testEmail}`);
    console.log(`✅ OTP: ${testOTP}`);
    console.log(`✅ Name: ${testName}`);
    console.log(`✅ Message: ${testMessage}`);

    // Note: In a real test environment, you would verify the email parameters
    // For this simple test, we just verify the function doesn't throw
    console.log(
      "✅ Email parameters would be verified in a real test environment",
    );
  } catch (error) {
    console.error("❌ OTP service test failed:", error.message);
    throw error;
  }
}

async function testGlobalMailService() {
  console.log("🧪 Testing Global Mail Service...");

  try {
    const testEmail = "test@example.com";
    const testMessage = "This is a test message";
    const testSubject = "Test Subject";
    const testHeader = "Test Header";

    // Note: This will not actually send email in development mode
    // as the globalMailService checks for ENV === "DEVELOPMENT"
    await gloabalMailMessage(testEmail, testMessage, testSubject, testHeader);

    console.log("✅ Global mail service test passed!");
    console.log("ℹ️  Note: Email sending is disabled in development mode");
  } catch (error) {
    console.error("❌ Global mail service test failed:", error.message);
    throw error;
  }
}

async function testEmailTemplate() {
  console.log("🧪 Testing Email Template...");

  try {
    const fs = require("fs");
    const path = require("path");
    const templatePath = path.resolve(
      __dirname,
      "./src/templates/sendOTP.html",
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error("Email template file not found");
    }

    const template = fs.readFileSync(templatePath, "utf8");

    // Check if template contains required placeholders
    const requiredPlaceholders = ["{{otp}}", "{{name}}", "{{message}}"];
    const missingPlaceholders = requiredPlaceholders.filter(
      (placeholder) => !template.includes(placeholder),
    );

    if (missingPlaceholders.length > 0) {
      throw new Error(
        `Missing placeholders: ${missingPlaceholders.join(", ")}`,
      );
    }

    console.log("✅ Email template test passed!");
    console.log("✅ Template contains all required placeholders");
    console.log(`✅ Template size: ${template.length} characters`);
  } catch (error) {
    console.error("❌ Email template test failed:", error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log("🚀 Starting OTP Service Tests...\n");

  try {
    await testOTPGeneration();
    console.log("");

    await testOTPService();
    console.log("");

    await testGlobalMailService();
    console.log("");

    await testEmailTemplate();
    console.log("");

    console.log("🎉 All OTP service tests passed successfully!");
    console.log("\n📋 Test Summary:");
    console.log("✅ OTP Generation - Working");
    console.log("✅ OTP Service - Working");
    console.log("✅ Global Mail Service - Working (Development mode)");
    console.log("✅ Email Template - Working");
  } catch (error) {
    console.error("\n💥 Test suite failed:", error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests();
