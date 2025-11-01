const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkProject() {
  const project = await prisma.project.findUnique({
    where: { id: "403f90bd-0f1f-4bde-a701-adc37ab35252" },
    include: {
      estimate: true,
      details: true,
      client: true,
    },
  });

  console.log("Project ID:", project?.id);
  console.log("Estimate ID:", project?.estimate?.id);
  console.log("Calculated Total:", project?.estimate?.calculatedTotal);
  console.log("Estimate Data:", JSON.stringify(project?.estimate, null, 2));

  await prisma.$disconnect();
}

checkProject().catch(console.error);
