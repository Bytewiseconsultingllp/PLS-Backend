import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================
// MODERATOR MANAGEMENT (ADMIN ONLY)
// ============================================

/**
 * Generate a random password
 */
function generateRandomPassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Generate username from email
 */
function generateUsernameFromEmail(email: string): string {
  const emailParts = email.split("@");
  const baseUsername = (emailParts[0] || "user").toLowerCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${baseUsername}_${timestamp}`;
}

/**
 * Create a new moderator
 * Admin provides: email and fullName
 * System generates: username and password
 */
export const createModerator = async (email: string, fullName: string) => {
  try {
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    // Generate credentials
    const username = generateUsernameFromEmail(email);
    const tempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create moderator user
    const moderator = await prisma.user.create({
      data: {
        username,
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: Role.MODERATOR,
        emailVerifiedAt: new Date(), // Auto-verify moderators
        isActive: true,
      },
      select: {
        uid: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      moderator,
      tempPassword, // Return password to be sent via email
    };
  } catch (error) {
    console.error("Error creating moderator:", error);
    throw error;
  }
};

/**
 * Get all moderators (paginated)
 */
export const getAllModerators = async (
  page = 1,
  limit = 20,
  includeInactive = false,
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    role: Role.MODERATOR,
    trashedAt: null,
  };

  if (!includeInactive) {
    where.isActive = true;
  }

  const [moderators, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        uid: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        moderatedProjects: {
          where: { deletedAt: null },
          select: {
            id: true,
            createdAt: true,
            details: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    moderators,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get moderator by ID with assigned projects
 */
export const getModeratorById = async (moderatorId: string) => {
  const moderator = await prisma.user.findFirst({
    where: {
      uid: moderatorId,
      role: Role.MODERATOR,
      trashedAt: null,
    },
    select: {
      uid: true,
      username: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      moderatedProjects: {
        where: { deletedAt: null },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          paymentStatus: true,
          details: {
            select: {
              companyName: true,
              businessEmail: true,
            },
          },
          milestones: {
            where: { deletedAt: null },
            select: {
              id: true,
              milestoneName: true,
              status: true,
              progress: true,
              isMilestoneCompleted: true,
            },
          },
          selectedFreelancers: {
            where: { deletedAt: null },
            select: {
              id: true,
              details: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!moderator) {
    throw new Error("Moderator not found");
  }

  return moderator;
};

/**
 * Update moderator information
 */
export const updateModerator = async (
  moderatorId: string,
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
  },
) => {
  const moderator = await prisma.user.findFirst({
    where: {
      uid: moderatorId,
      role: Role.MODERATOR,
      trashedAt: null,
    },
  });

  if (!moderator) {
    throw new Error("Moderator not found");
  }

  // If email is being changed, check it's not already in use
  if (data.email && data.email !== moderator.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }
  }

  return await prisma.user.update({
    where: { uid: moderatorId },
    data: {
      ...(data.fullName && { fullName: data.fullName }),
      ...(data.email && { email: data.email.toLowerCase() }),
      ...(data.phone && { phone: data.phone }),
    },
    select: {
      uid: true,
      username: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Toggle moderator active status (deactivate/activate)
 */
export const toggleModeratorActiveStatus = async (
  moderatorId: string,
  isActive: boolean,
) => {
  const moderator = await prisma.user.findFirst({
    where: {
      uid: moderatorId,
      role: Role.MODERATOR,
      trashedAt: null,
    },
  });

  if (!moderator) {
    throw new Error("Moderator not found");
  }

  return await prisma.user.update({
    where: { uid: moderatorId },
    data: { isActive },
    select: {
      uid: true,
      username: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Delete moderator (soft delete)
 */
export const deleteModerator = async (
  moderatorId: string,
  adminUserId: string,
) => {
  const moderator = await prisma.user.findFirst({
    where: {
      uid: moderatorId,
      role: Role.MODERATOR,
      trashedAt: null,
    },
    include: {
      moderatedProjects: {
        where: { deletedAt: null },
        select: { id: true },
      },
    },
  });

  if (!moderator) {
    throw new Error("Moderator not found");
  }

  // Check if moderator has assigned projects
  if (moderator.moderatedProjects.length > 0) {
    throw new Error(
      `Cannot delete moderator. They are currently assigned to ${moderator.moderatedProjects.length} project(s). Please unassign them first.`,
    );
  }

  return await prisma.user.update({
    where: { uid: moderatorId },
    data: {
      trashedAt: new Date(),
      trashedBy: adminUserId,
      isActive: false,
    },
    select: {
      uid: true,
      username: true,
      fullName: true,
      email: true,
      role: true,
      trashedAt: true,
    },
  });
};

// ============================================
// PROJECT-MODERATOR ASSIGNMENT (ADMIN ONLY)
// ============================================

/**
 * Assign moderator to a project
 * If project already has a moderator, this will replace them
 */
export const assignModeratorToProject = async (
  projectId: string,
  moderatorId: string,
) => {
  // Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId, deletedAt: null },
    include: {
      assignedModerator: {
        select: {
          uid: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Verify moderator exists and is active
  const moderator = await prisma.user.findFirst({
    where: {
      uid: moderatorId,
      role: Role.MODERATOR,
      trashedAt: null,
    },
  });

  if (!moderator) {
    throw new Error("Moderator not found");
  }

  if (!moderator.isActive) {
    throw new Error("Cannot assign inactive moderator to project");
  }

  // Assign moderator (will replace existing if any)
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      assignedModeratorId: moderatorId,
    },
    include: {
      assignedModerator: {
        select: {
          uid: true,
          username: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      details: {
        select: {
          companyName: true,
        },
      },
    },
  });

  return {
    project: updatedProject,
    previousModerator: project.assignedModerator,
    newModerator: moderator,
  };
};

/**
 * Unassign moderator from a project
 */
export const unassignModeratorFromProject = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId, deletedAt: null },
    include: {
      assignedModerator: {
        select: {
          uid: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (!project.assignedModeratorId) {
    throw new Error("No moderator is currently assigned to this project");
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      assignedModeratorId: null,
    },
    include: {
      details: {
        select: {
          companyName: true,
        },
      },
    },
  });

  return {
    project: updatedProject,
    unassignedModerator: project.assignedModerator,
  };
};

// ============================================
// MODERATOR SELF-SERVICE
// ============================================

/**
 * Get projects assigned to a specific moderator
 */
export const getModeratorProjects = async (
  moderatorUserId: string,
  page = 1,
  limit = 20,
) => {
  const skip = (page - 1) * limit;

  // Verify user is a moderator
  const moderator = await prisma.user.findFirst({
    where: {
      uid: moderatorUserId,
      role: Role.MODERATOR,
      trashedAt: null,
    },
  });

  if (!moderator) {
    throw new Error("Moderator not found or inactive");
  }

  if (!moderator.isActive) {
    throw new Error(
      "Your moderator account is inactive. Please contact admin.",
    );
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: {
        assignedModeratorId: moderatorUserId,
        deletedAt: null,
      },
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        paymentStatus: true,
        acceptingBids: true,
        discordChatUrl: true,
        details: true,
        services: true,
        industries: true,
        technologies: true,
        features: true,
        timeline: true,
        // Exclude pricing from moderator view
        milestones: {
          where: { deletedAt: null },
          orderBy: { deadline: "asc" },
        },
        selectedFreelancers: {
          where: { deletedAt: null },
          select: {
            id: true,
            details: {
              select: {
                fullName: true,
                email: true,
                primaryDomain: true,
              },
            },
          },
        },
        client: {
          select: {
            uid: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.project.count({
      where: {
        assignedModeratorId: moderatorUserId,
        deletedAt: null,
      },
    }),
  ]);

  return {
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single project details (moderator must be assigned)
 */
export const getModeratorProjectById = async (
  projectId: string,
  moderatorUserId: string,
) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      assignedModeratorId: moderatorUserId,
      deletedAt: null,
    },
    include: {
      details: true,
      services: true,
      industries: true,
      technologies: true,
      features: true,
      timeline: true,
      // Exclude pricing
      milestones: {
        where: { deletedAt: null },
        orderBy: { deadline: "asc" },
      },
      selectedFreelancers: {
        where: { deletedAt: null },
        include: {
          details: true,
        },
      },
      client: {
        select: {
          uid: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found or you are not assigned as moderator");
  }

  return project;
};

export default {
  createModerator,
  getAllModerators,
  getModeratorById,
  updateModerator,
  toggleModeratorActiveStatus,
  deleteModerator,
  assignModeratorToProject,
  unassignModeratorFromProject,
  getModeratorProjects,
  getModeratorProjectById,
};
