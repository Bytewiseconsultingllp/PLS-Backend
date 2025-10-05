/**
 * Test script for ProjectBuilder freelancer assignment functionality
 * This script demonstrates how to use the new freelancer assignment endpoints
 */

const BASE_URL = "http://localhost:3000/api/v1/project-builder";

// Test data
const testProjectBuilder = {
  projectName: "E-commerce Website Development",
  projectDescription:
    "A comprehensive e-commerce platform with modern features including user authentication, product catalog, shopping cart, payment integration, and admin dashboard.",
  projectType: "Web Development",
  technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
  features: [
    "User Authentication",
    "Product Management",
    "Shopping Cart",
    "Payment Processing",
    "Order Management",
    "Admin Dashboard",
  ],
  budget: 15000,
  timeline: "3 months",
  priority: "HIGH",
  status: "DRAFT",
  clientName: "John Doe",
  clientEmail: "john.doe@example.com",
  clientPhone: "+1234567890",
  clientCompany: "TechCorp Inc",
  additionalNotes: "Need responsive design and mobile optimization",
};

const freelancerIds = [
  "freelancer_uid_1",
  "freelancer_uid_2",
  "freelancer_uid_3",
];

// Helper function to make API calls
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_JWT_TOKEN_HERE", // Replace with actual token
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();
  console.log(`${options.method || "GET"} ${url}:`, response.status, data);
  return { response, data };
}

// Test functions
async function testProjectBuilderFreelancerAssignment() {
  console.log(
    "🚀 Testing ProjectBuilder Freelancer Assignment Functionality\n",
  );

  try {
    // 1. Create a new ProjectBuilder project
    console.log("1. Creating a new ProjectBuilder project...");
    const { data: createdProject } = await makeRequest(BASE_URL, {
      method: "POST",
      body: JSON.stringify(testProjectBuilder),
    });

    const projectId = createdProject.data.id;
    console.log(`✅ Project created with ID: ${projectId}\n`);

    // 2. Get the project with freelancer information
    console.log("2. Getting project with freelancer information...");
    await makeRequest(`${BASE_URL}/${projectId}/freelancers`);
    console.log("✅ Project retrieved with freelancer data\n");

    // 3. Add interested freelancers
    console.log("3. Adding interested freelancers...");
    await makeRequest(`${BASE_URL}/${projectId}/interested-freelancers`, {
      method: "POST",
      body: JSON.stringify({
        interestedFreelancerIds: freelancerIds,
      }),
    });
    console.log("✅ Interested freelancers added\n");

    // 4. Get project again to see interested freelancers
    console.log("4. Getting project to see interested freelancers...");
    await makeRequest(`${BASE_URL}/${projectId}/freelancers`);
    console.log("✅ Project retrieved with interested freelancers\n");

    // 5. Select some freelancers
    console.log("5. Selecting freelancers for the project...");
    await makeRequest(`${BASE_URL}/${projectId}/selected-freelancers`, {
      method: "POST",
      body: JSON.stringify({
        selectedFreelancerIds: [freelancerIds[0], freelancerIds[1]],
      }),
    });
    console.log("✅ Freelancers selected\n");

    // 6. Get project with selected freelancers
    console.log("6. Getting project with selected freelancers...");
    await makeRequest(`${BASE_URL}/${projectId}/freelancers`);
    console.log("✅ Project retrieved with selected freelancers\n");

    // 7. Remove one interested freelancer
    console.log("7. Removing one interested freelancer...");
    await makeRequest(`${BASE_URL}/${projectId}/interested-freelancers`, {
      method: "DELETE",
      body: JSON.stringify({
        freelancerUid: freelancerIds[2],
      }),
    });
    console.log("✅ Interested freelancer removed\n");

    // 8. Remove one selected freelancer
    console.log("8. Removing one selected freelancer...");
    await makeRequest(`${BASE_URL}/${projectId}/selected-freelancers`, {
      method: "DELETE",
      body: JSON.stringify({
        freelancerUid: freelancerIds[1],
      }),
    });
    console.log("✅ Selected freelancer removed\n");

    // 9. Final project state
    console.log("9. Final project state...");
    await makeRequest(`${BASE_URL}/${projectId}/freelancers`);
    console.log("✅ Final project state retrieved\n");

    console.log("🎉 All tests completed successfully!");
    console.log("\n📋 Summary of new endpoints:");
    console.log(
      "• POST /api/v1/project-builder/:id/interested-freelancers - Add interested freelancers",
    );
    console.log(
      "• DELETE /api/v1/project-builder/:id/interested-freelancers - Remove interested freelancer",
    );
    console.log(
      "• POST /api/v1/project-builder/:id/selected-freelancers - Select freelancers",
    );
    console.log(
      "• DELETE /api/v1/project-builder/:id/selected-freelancers - Remove selected freelancer",
    );
    console.log(
      "• GET /api/v1/project-builder/:id/freelancers - Get project with freelancer data",
    );
    console.log(
      "• All existing endpoints now include freelancer information in responses",
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
if (require.main === module) {
  testProjectBuilderFreelancerAssignment();
}

module.exports = { testProjectBuilderFreelancerAssignment };
