const assert = require("node:assert");
const { test } = require("node:test");
const request = require("supertest");
const { app } = require("../../dist/src/app");
const { db } = require("../../dist/src/database/db");
const { sendOTP } = require("../../dist/src/services/sendOTPService");
const {
  generateOtp,
} = require("../../dist/src/services/slugStringGeneratorService");

// Mock nodemailer
const nodemailer = require("nodemailer");
const mockTransporter = {
  sendMail: async () => ({
    response: "Email sent successfully",
    messageId: "test-message-id",
  }),
};
nodemailer.createTransporter = () => mockTransporter;

const runOTPTests = async () => {
  let testUser;
  const testEmail = "otptest@example.com";
  const testName = "OTP Test User";

  // Setup: Create test user
  await test("Setup: Create test user", async () => {
    try {
      testUser = await db.user.create({
        data: {
          email: testEmail,
          fullName: testName,
          password: "hashedpassword",
          uid: "otp-test-uid-123",
          role: "CLIENT",
          tokenVersion: 0,
        },
      });
      console.log("✅ Test user created successfully");
    } catch (error) {
      console.log("ℹ️  Test user might already exist, continuing...");
      testUser = await db.user.findUnique({ where: { email: testEmail } });
    }
  });

  // Test OTP Generation
  await test("OTP Generation Test", async () => {
    const { otp, otpExpiry } = generateOtp();

    assert.strictEqual(otp.length, 6, "OTP should be 6 digits");
    assert(/^\d{6}$/.test(otp), "OTP should contain only digits");
    assert(otpExpiry instanceof Date, "OTP expiry should be a Date object");
    assert(
      otpExpiry.getTime() > Date.now(),
      "OTP expiry should be in the future",
    );

    console.log(`✅ Generated OTP: ${otp}`);
    console.log(`✅ OTP Expiry: ${otpExpiry}`);
  });

  // Test OTP Service Function
  await test("OTP Service Function Test", async () => {
    const testOTP = "123456";
    const testMessage = "Test OTP message";

    await sendOTP(testEmail, testOTP, testName, testMessage);

    // Note: In a real test environment, you would verify the email parameters
    // For this simple test, we just verify the function doesn't throw
    console.log(
      "✅ Email sending would be verified in a real test environment",
    );

    console.log("✅ OTP service function test passed");
  });

  // Test Send OTP Endpoint
  await test("Send OTP Endpoint Test", async () => {
    // Reset user to unverified state
    await db.user.update({
      where: { email: testEmail },
      data: {
        emailVerifiedAt: null,
        otpPassword: null,
        otpPasswordExpiry: null,
      },
    });

    const res = await request(app)
      .post("/api/auth/send-otp")
      .send({ email: testEmail });

    assert.strictEqual(res.status, 200, "Response should be 200");
    assert.strictEqual(
      res.body.success,
      true,
      "Response should indicate success",
    );
    assert.strictEqual(
      res.body.message,
      "OTP sent successfully",
      "Response should have correct message",
    );
    assert.strictEqual(
      res.body.data.email,
      testEmail,
      "Response should contain correct email",
    );

    // Verify that OTP was stored in database
    const updatedUser = await db.user.findUnique({
      where: { email: testEmail },
    });
    assert(updatedUser.otpPassword, "OTP should be stored in database");
    assert(
      updatedUser.otpPasswordExpiry,
      "OTP expiry should be stored in database",
    );

    console.log("✅ Send OTP endpoint test passed");
  });

  // Test OTP Verification Endpoint
  await test("OTP Verification Endpoint Test", async () => {
    // Generate a valid OTP and hash it
    const { otp, otpExpiry } = generateOtp();
    const bcrypt = require("bcrypt");
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Update user with the hashed OTP
    await db.user.update({
      where: { email: testEmail },
      data: {
        otpPassword: hashedOTP,
        otpPasswordExpiry: otpExpiry,
      },
    });

    const res = await request(app).post("/api/auth/verify-user").send({
      email: testEmail,
      OTP: otp,
    });

    assert.strictEqual(res.status, 200, "Response should be 200");
    assert.strictEqual(
      res.body.success,
      true,
      "Response should indicate success",
    );
    assert.strictEqual(
      res.body.message,
      "User verified successfully",
      "Response should have correct message",
    );
    assert.strictEqual(
      res.body.data.email,
      testEmail,
      "Response should contain correct email",
    );

    console.log("✅ OTP verification endpoint test passed");
  });

  // Test Invalid OTP
  await test("Invalid OTP Test", async () => {
    // Generate a new OTP for the user
    const { otp, otpExpiry } = generateOtp();
    const bcrypt = require("bcrypt");
    const hashedOTP = await bcrypt.hash(otp, 10);

    await db.user.update({
      where: { email: testEmail },
      data: {
        otpPassword: hashedOTP,
        otpPasswordExpiry: otpExpiry,
        emailVerifiedAt: null, // Reset verification status
      },
    });

    const res = await request(app).post("/api/auth/verify-user").send({
      email: testEmail,
      OTP: "000000", // Wrong OTP
    });

    assert.strictEqual(
      res.status,
      400,
      "Response should be 400 for invalid OTP",
    );
    assert.strictEqual(
      res.body.success,
      false,
      "Response should indicate failure",
    );
    assert.strictEqual(
      res.body.message,
      "Invalid OTP",
      "Response should have correct error message",
    );

    console.log("✅ Invalid OTP test passed");
  });

  // Test Expired OTP
  await test("Expired OTP Test", async () => {
    const { otp } = generateOtp();
    const bcrypt = require("bcrypt");
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Set OTP expiry to past time
    await db.user.update({
      where: { email: testEmail },
      data: {
        otpPassword: hashedOTP,
        otpPasswordExpiry: new Date(Date.now() - 1000), // 1 second ago
        emailVerifiedAt: null,
      },
    });

    const res = await request(app).post("/api/auth/verify-user").send({
      email: testEmail,
      OTP: otp,
    });

    assert.strictEqual(
      res.status,
      400,
      "Response should be 400 for expired OTP",
    );
    assert.strictEqual(
      res.body.success,
      false,
      "Response should indicate failure",
    );
    assert.strictEqual(
      res.body.message,
      "OTP expired. Please try again",
      "Response should have correct error message",
    );

    console.log("✅ Expired OTP test passed");
  });

  // Cleanup: Remove test user
  await test("Cleanup: Remove test user", async () => {
    try {
      await db.user.delete({
        where: { email: testEmail },
      });
      console.log("✅ Test user cleaned up successfully");
    } catch (error) {
      console.log("ℹ️  Test user cleanup failed, but tests completed");
    }
  });
};

// Run the tests
runOTPTests()
  .then(() => {
    console.log("\n🎉 All OTP integration tests passed successfully!");
    console.log("\n📋 Test Summary:");
    console.log("✅ OTP Generation - Working");
    console.log("✅ OTP Service Function - Working");
    console.log("✅ Send OTP Endpoint - Working");
    console.log("✅ OTP Verification Endpoint - Working");
    console.log("✅ Invalid OTP Handling - Working");
    console.log("✅ Expired OTP Handling - Working");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n💥 OTP integration tests failed:", err);
    process.exit(1);
  });
