#!/usr/bin/env node
/**
 * Generate Swagger JSON spec at build time
 * This ensures the spec works in Vercel's serverless environment
 */

const fs = require("fs");
const path = require("path");

console.log("📝 Generating Swagger specification...");
console.log("Working directory:", process.cwd());

// Import the swagger config (will use the compiled JS version)
const swaggerConfigPath = path.join(__dirname, "../dist/src/config/swagger.js");

if (!fs.existsSync(swaggerConfigPath)) {
  console.error("❌ Error: Swagger config not found at:", swaggerConfigPath);
  console.error("   Make sure to run 'npm run build' first!");
  process.exit(1);
}

try {
  const { swaggerSpec } = require(swaggerConfigPath);

  // Ensure public directory exists
  const publicDir = path.join(__dirname, "../dist/public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Also create in src/public for development
  const srcPublicDir = path.join(__dirname, "../src/public");
  if (!fs.existsSync(srcPublicDir)) {
    fs.mkdirSync(srcPublicDir, { recursive: true });
  }

  // Write to both locations
  const distPath = path.join(publicDir, "swagger.json");
  const srcPath = path.join(srcPublicDir, "swagger.json");

  const specJson = JSON.stringify(swaggerSpec, null, 2);

  fs.writeFileSync(distPath, specJson);
  fs.writeFileSync(srcPath, specJson);

  const pathCount = Object.keys(swaggerSpec.paths || {}).length;
  const tagCount = swaggerSpec.tags?.length || 0;

  console.log(`✅ Swagger spec generated successfully!`);
  console.log(`   📁 Dist: ${distPath}`);
  console.log(`   📁 Src: ${srcPath}`);
  console.log(`   📊 Total endpoints: ${pathCount}`);
  console.log(`   🏷️  Total tags: ${tagCount}`);

  if (pathCount === 0) {
    console.warn(
      "⚠️  WARNING: No API endpoints found! Check your swagger documentation.",
    );
  }
} catch (error) {
  console.error("❌ Error generating Swagger spec:", error.message);
  console.error(error.stack);
  process.exit(1);
}
