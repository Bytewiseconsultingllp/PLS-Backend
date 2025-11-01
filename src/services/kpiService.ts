/**
 * KPI Service
 *
 * Handles KPI (Key Performance Indicator) points and ranking system for freelancers.
 * Points can be assigned by Admin, Moderator (for their projects), and Clients (for their projects).
 */

import { db } from "../database/db";
import type { KPIRANK } from "@prisma/client";

// ============================================
// TYPES
// ============================================

interface AssignKPIPointsData {
  points: number; // Can be positive (reward) or negative (penalty)
  note: string; // Reason for the points
  assignedBy: string; // UID of who assigned the points
  assignedByRole: string; // Role of who assigned (ADMIN, MODERATOR, CLIENT)
}

// ============================================
// KPI RANK CALCULATION
// ============================================

/**
 * Calculate KPI rank based on total points
 * @param points - Total KPI points
 * @returns KPIRANK enum value
 */
export const calculateKPIRank = (points: number): KPIRANK => {
  if (points < 50) return "BRONZE";
  if (points < 200) return "SILVER";
  if (points < 500) return "GOLD";
  if (points < 1000) return "PLATINIUM";
  if (points < 2000) return "DIAMOND";
  if (points < 5000) return "CROWN";
  if (points < 10000) return "ACE";
  return "CONQUERER";
};

// ============================================
// ASSIGN KPI POINTS
// ============================================

/**
 * Assign KPI points to a freelancer
 * @param freelancerId - Freelancer ID (UUID)
 * @param data - Points and assignment data
 * @returns Updated freelancer with new KPI data
 */
export const assignKPIPoints = async (
  freelancerId: string,
  data: AssignKPIPointsData,
) => {
  // Get current freelancer data
  const freelancer = await db.freelancer.findUnique({
    where: { id: freelancerId },
    include: {
      user: {
        select: {
          uid: true,
          kpiRankPoints: true,
          kpiRank: true,
          kpiHistory: true,
        },
      },
    },
  });

  if (!freelancer || !freelancer.user) {
    throw new Error("Freelancer not found");
  }

  // Calculate new total points
  const currentPoints = freelancer.user.kpiRankPoints;
  const newPoints = currentPoints + data.points;

  // Calculate new rank
  const newRank = calculateKPIRank(newPoints);

  // Create history entry
  const historyEntry = {
    points: data.points,
    note: data.note,
    assignedBy: data.assignedBy,
    assignedByRole: data.assignedByRole,
    previousPoints: currentPoints,
    newPoints: newPoints,
    previousRank: freelancer.user.kpiRank,
    newRank: newRank,
    timestamp: new Date().toISOString(),
  };

  // Get existing history
  const existingHistory = (freelancer.user.kpiHistory || []) as Array<{
    points: number;
    note: string;
    assignedBy: string;
    assignedByRole: string;
    previousPoints: number;
    newPoints: number;
    previousRank: KPIRANK;
    newRank: KPIRANK;
    timestamp: string;
  }>;

  // Update user with new KPI data
  const updatedUser = await db.user.update({
    where: { uid: freelancer.user.uid },
    data: {
      kpiRankPoints: newPoints,
      kpiRank: newRank,
      kpiHistory: [...existingHistory, historyEntry],
    },
    select: {
      uid: true,
      username: true,
      fullName: true,
      kpiRankPoints: true,
      kpiRank: true,
      kpiHistory: true,
    },
  });

  return {
    freelancer: {
      id: freelancer.id,
      userId: freelancer.user.uid,
    },
    kpi: {
      points: updatedUser.kpiRankPoints,
      rank: updatedUser.kpiRank,
      previousPoints: currentPoints,
      pointsChange: data.points,
    },
    user: {
      uid: updatedUser.uid,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
    },
  };
};

// ============================================
// GET FREELANCER KPI
// ============================================

/**
 * Get KPI information for a freelancer
 * @param freelancerId - Freelancer ID (UUID)
 * @returns KPI data
 */
export const getFreelancerKPI = async (freelancerId: string) => {
  const freelancer = await db.freelancer.findUnique({
    where: { id: freelancerId },
    include: {
      user: {
        select: {
          uid: true,
          username: true,
          fullName: true,
          kpiRankPoints: true,
          kpiRank: true,
        },
      },
      details: {
        select: {
          fullName: true,
        },
      },
    },
  });

  if (!freelancer || !freelancer.user) {
    throw new Error("Freelancer not found");
  }

  return {
    freelancer: {
      id: freelancer.id,
      userId: freelancer.user.uid,
      name: freelancer.details?.fullName || freelancer.user.fullName,
    },
    kpi: {
      points: freelancer.user.kpiRankPoints,
      rank: freelancer.user.kpiRank,
    },
  };
};

// ============================================
// GET KPI HISTORY
// ============================================

/**
 * Get KPI history for a freelancer
 * @param freelancerId - Freelancer ID (UUID)
 * @param limit - Number of history entries to return (default: 50)
 * @returns KPI history
 */
export const getKPIHistory = async (freelancerId: string, limit = 50) => {
  const freelancer = await db.freelancer.findUnique({
    where: { id: freelancerId },
    include: {
      user: {
        select: {
          uid: true,
          username: true,
          fullName: true,
          kpiRankPoints: true,
          kpiRank: true,
          kpiHistory: true,
        },
      },
    },
  });

  if (!freelancer || !freelancer.user) {
    throw new Error("Freelancer not found");
  }

  const history = (freelancer.user.kpiHistory || []) as Array<{
    points: number;
    note: string;
    assignedBy: string;
    assignedByRole: string;
    previousPoints: number;
    newPoints: number;
    previousRank: KPIRANK;
    newRank: KPIRANK;
    timestamp: string;
  }>;

  // Return most recent entries first
  const recentHistory = history.slice(-limit).reverse();

  return {
    freelancer: {
      id: freelancer.id,
      userId: freelancer.user.uid,
      name: freelancer.user.fullName,
    },
    currentKPI: {
      points: freelancer.user.kpiRankPoints,
      rank: freelancer.user.kpiRank,
    },
    history: recentHistory,
    totalEntries: history.length,
  };
};

// ============================================
// GET LEADERBOARD
// ============================================

/**
 * Get top freelancers by KPI points
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @returns Leaderboard data
 */
export const getKPILeaderboard = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  // Get all freelancers with their KPI data, sorted by points
  const [freelancers, total] = await Promise.all([
    db.freelancer.findMany({
      where: {
        status: "ACCEPTED", // Only show accepted freelancers
        user: {
          isActive: true, // Only active users
        },
      },
      include: {
        user: {
          select: {
            uid: true,
            username: true,
            fullName: true,
            kpiRankPoints: true,
            kpiRank: true,
          },
        },
        details: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        user: {
          kpiRankPoints: "desc",
        },
      },
      skip,
      take: limit,
    }),
    db.freelancer.count({
      where: {
        status: "ACCEPTED",
        user: {
          isActive: true,
        },
      },
    }),
  ]);

  // Format leaderboard data
  const leaderboard = freelancers.map((freelancer, index) => ({
    rank: skip + index + 1,
    freelancer: {
      id: freelancer.id,
      userId: freelancer.user?.uid || "",
      username: freelancer.user?.username || "",
      fullName: freelancer.details?.fullName || freelancer.user?.fullName || "",
      profilePicture: null,
    },
    kpi: {
      points: freelancer.user?.kpiRankPoints || 0,
      rank: (freelancer.user?.kpiRank as KPIRANK) || "BRONZE",
    },
  }));

  return {
    leaderboard,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// VALIDATE AUTHORIZATION
// ============================================

/**
 * Check if user is authorized to assign KPI points to a freelancer
 * @param userId - User ID of who wants to assign points
 * @param userRole - Role of the user
 * @param freelancerId - Freelancer ID
 * @param projectId - Optional project ID (for Moderator/Client validation)
 * @returns Boolean indicating if authorized
 */
export const canAssignKPIPoints = async (
  userId: string,
  userRole: string,
  freelancerId: string,
  projectId?: string,
): Promise<{ authorized: boolean; reason?: string }> => {
  // Admin can assign to anyone
  if (userRole === "ADMIN") {
    return { authorized: true };
  }

  // Moderator can only assign to freelancers on their assigned projects
  if (userRole === "MODERATOR") {
    if (!projectId) {
      return {
        authorized: false,
        reason: "Project ID required for moderator",
      };
    }

    // Check if moderator is assigned to the project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        assignedModeratorId: userId,
        deletedAt: null,
      },
    });

    if (!project) {
      return {
        authorized: false,
        reason: "Moderator not assigned to this project",
      };
    }

    // Check if freelancer is working on this project
    const isFreelancerOnProject = await db.project.findFirst({
      where: {
        id: projectId,
        selectedFreelancers: {
          some: {
            id: freelancerId,
          },
        },
      },
    });

    if (!isFreelancerOnProject) {
      return {
        authorized: false,
        reason: "Freelancer not working on this project",
      };
    }

    return { authorized: true };
  }

  // Client can only assign to freelancers on their projects
  if (userRole === "CLIENT") {
    if (!projectId) {
      return { authorized: false, reason: "Project ID required for client" };
    }

    // Check if client owns the project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        clientId: userId,
        deletedAt: null,
      },
    });

    if (!project) {
      return { authorized: false, reason: "Client doesn't own this project" };
    }

    // Check if freelancer is working on this project
    const isFreelancerOnProject = await db.project.findFirst({
      where: {
        id: projectId,
        selectedFreelancers: {
          some: {
            id: freelancerId,
          },
        },
      },
    });

    if (!isFreelancerOnProject) {
      return {
        authorized: false,
        reason: "Freelancer not working on this project",
      };
    }

    return { authorized: true };
  }

  return { authorized: false, reason: "Invalid role" };
};

// ============================================
// EXPORTS
// ============================================

export default {
  assignKPIPoints,
  getFreelancerKPI,
  getKPIHistory,
  getKPILeaderboard,
  canAssignKPIPoints,
  calculateKPIRank,
};
