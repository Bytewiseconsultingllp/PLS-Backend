import {
  BADREQUESTCODE,
  NOTFOUNDCODE,
  SUCCESSCODE,
  SUCCESSMSG,
  UNAUTHORIZEDCODE,
} from "../../constants";
import { projectService } from "../../services/projectService";
import type { TPROJECT_CREATE, TMILESTONE } from "../../types";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import type { _Request } from "../../middlewares/authMiddleware";

export default {
  /**
   * Create project from visitor data
   * Called after visitor completes all steps and registers as client
   */
  createProjectFromVisitor: asyncHandler(async (req: _Request, res) => {
    const { visitorId } = req.body;
    const clientId = req.userFromToken?.uid;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!visitorId) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    const project = await projectService.createProjectFromVisitor(
      clientId,
      visitorId,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Project created successfully from visitor data",
      project,
    );
  }),

  /**
   * Create project directly (for existing clients adding new projects)
   */
  createProject: asyncHandler(async (req: _Request, res) => {
    const projectData = req.body as TPROJECT_CREATE;
    const clientId = req.userFromToken?.uid;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    // Override clientId with authenticated user's ID
    projectData.clientId = clientId;

    const project = await projectService.createProject(projectData);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Project created successfully",
      project,
    );
  }),

  /**
   * Get single project by ID
   */
  getSingleProject: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Project ID is required" };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // Check authorization - only client who owns project or admin can view
    if (userRole !== "ADMIN" && project.clientId !== userId) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "You don't have permission to view this project",
      };
    }

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, project);
  }),

  /**
   * Get all projects for authenticated client
   */
  getMyProjects: asyncHandler(async (req: _Request, res) => {
    const clientId = req.userFromToken?.uid;
    const { page = "1", limit = "10" } = req.query;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await projectService.getProjectsByClientId(clientId, {
      page: pageNum,
      limit: limitNum,
    });

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, result);
  }),

  /**
   * Get all projects (Admin only)
   */
  getAllProjects: asyncHandler(async (req: _Request, res) => {
    const userRole = req.userFromToken?.role;
    const { page = "1", limit = "10" } = req.query;

    if (userRole !== "ADMIN") {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Only admins can view all projects",
      };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await projectService.getAllProjects({
      page: pageNum,
      limit: limitNum,
    });

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, result);
  }),

  /**
   * Update project discord chat URL
   */
  updateProjectDiscordUrl: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const { discordChatUrl } = req.body;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Project ID is required" };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // Check authorization
    if (userRole !== "ADMIN" && project.clientId !== userId) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "You don't have permission to update this project",
      };
    }

    await projectService.updateProjectDiscordUrl(id, discordChatUrl);

    const updatedProject = await projectService.getProjectById(id);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Discord URL updated successfully",
      updatedProject,
    );
  }),

  /**
   * Add milestone to project
   */
  addMilestone: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const milestoneData = req.body as TMILESTONE;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Project ID is required" };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // ✅ Check if payment is completed before allowing milestone creation
    if (project.paymentStatus !== "SUCCEEDED") {
      throw {
        status: BADREQUESTCODE,
        message:
          "Cannot create milestones for projects with pending payment. Payment must be completed first.",
      };
    }

    // Check authorization: Client, Admin, or assigned Moderator
    const isAuthorized =
      userRole === "ADMIN" ||
      project.clientId === userId ||
      (userRole === "MODERATOR" && project.assignedModeratorId === userId);

    if (!isAuthorized) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "You don't have permission to add milestones to this project",
      };
    }

    const milestone = await projectService.addMilestone(id, milestoneData);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Milestone added successfully",
      milestone,
    );
  }),

  /**
   * Update milestone
   */
  updateMilestone: asyncHandler(async (req: _Request, res) => {
    const { id, milestoneId } = req.params;
    const milestoneData = req.body as Partial<TMILESTONE>;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id || !milestoneId) {
      throw {
        status: BADREQUESTCODE,
        message: "Project ID and Milestone ID are required",
      };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // Check authorization: Client, Admin, or assigned Moderator
    const isAuthorized =
      userRole === "ADMIN" ||
      project.clientId === userId ||
      (userRole === "MODERATOR" && project.assignedModeratorId === userId);

    if (!isAuthorized) {
      throw {
        status: UNAUTHORIZEDCODE,
        message:
          "You don't have permission to update milestones in this project",
      };
    }

    const milestone = await projectService.updateMilestone(
      milestoneId,
      milestoneData,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Milestone updated successfully",
      milestone,
    );
  }),

  /**
   * Delete milestone
   */
  deleteMilestone: asyncHandler(async (req: _Request, res) => {
    const { id, milestoneId } = req.params;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id || !milestoneId) {
      throw {
        status: BADREQUESTCODE,
        message: "Project ID and Milestone ID are required",
      };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // Check authorization: Client, Admin, or assigned Moderator
    const isAuthorized =
      userRole === "ADMIN" ||
      project.clientId === userId ||
      (userRole === "MODERATOR" && project.assignedModeratorId === userId);

    if (!isAuthorized) {
      throw {
        status: UNAUTHORIZEDCODE,
        message:
          "You don't have permission to delete milestones in this project",
      };
    }

    await projectService.deleteMilestone(milestoneId);

    httpResponse(req, res, SUCCESSCODE, "Milestone deleted successfully", null);
  }),

  /**
   * Moderator approve milestone
   */
  moderatorApproveMilestone: asyncHandler(async (req: _Request, res) => {
    const { id, milestoneId } = req.params;
    const { moderatorApproved, moderatorNotes } = req.body;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id || !milestoneId) {
      throw {
        status: BADREQUESTCODE,
        message: "Project ID and Milestone ID are required",
      };
    }

    // Only MODERATOR or ADMIN can approve
    if (userRole !== "ADMIN" && userRole !== "MODERATOR") {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Only moderators and admins can approve milestones",
      };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // Moderators can only approve milestones for projects they're assigned to
    if (userRole === "MODERATOR" && project.assignedModeratorId !== userId) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "You are not assigned as moderator for this project",
      };
    }

    const milestone = await projectService.moderatorApproveMilestone(
      milestoneId,
      moderatorApproved,
      userId!,
      moderatorNotes,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      moderatorApproved
        ? "Milestone approved successfully"
        : "Milestone approval revoked",
      milestone,
    );
  }),

  /**
   * Add interested freelancer to project
   */
  addInterestedFreelancer: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const { freelancerId } = req.body;
    const userRole = req.userFromToken?.role;

    if (!id || !freelancerId) {
      throw {
        status: BADREQUESTCODE,
        message: "Project ID and Freelancer ID are required",
      };
    }

    if (userRole !== "ADMIN") {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Only admins can manage freelancer assignments",
      };
    }

    await projectService.addInterestedFreelancer(id, freelancerId);

    const project = await projectService.getProjectById(id);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Interested freelancer added successfully",
      project,
    );
  }),

  /**
   * Select freelancer for project
   */
  selectFreelancer: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const { freelancerId } = req.body;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id || !freelancerId) {
      throw {
        status: BADREQUESTCODE,
        message: "Project ID and Freelancer ID are required",
      };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // Client or admin can select freelancers
    if (userRole !== "ADMIN" && project.clientId !== userId) {
      throw {
        status: UNAUTHORIZEDCODE,
        message:
          "You don't have permission to select freelancers for this project",
      };
    }

    await projectService.selectFreelancer(id, freelancerId);

    const updatedProject = await projectService.getProjectById(id);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Freelancer selected successfully",
      updatedProject,
    );
  }),

  /**
   * Remove interested freelancer
   */
  removeInterestedFreelancer: asyncHandler(async (req: _Request, res) => {
    const { id, freelancerId } = req.params;
    const userRole = req.userFromToken?.role;

    if (!id || !freelancerId) {
      throw {
        status: BADREQUESTCODE,
        message: "Project ID and Freelancer ID are required",
      };
    }

    if (userRole !== "ADMIN") {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "Only admins can manage freelancer assignments",
      };
    }

    await projectService.removeInterestedFreelancer(id, freelancerId);

    const project = await projectService.getProjectById(id);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Interested freelancer removed successfully",
      project,
    );
  }),

  /**
   * Remove selected freelancer
   */
  removeSelectedFreelancer: asyncHandler(async (req: _Request, res) => {
    const { id, freelancerId } = req.params;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id || !freelancerId) {
      throw {
        status: BADREQUESTCODE,
        message: "Project ID and Freelancer ID are required",
      };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // Client or admin can remove selected freelancers
    if (userRole !== "ADMIN" && project.clientId !== userId) {
      throw {
        status: UNAUTHORIZEDCODE,
        message:
          "You don't have permission to remove freelancers from this project",
      };
    }

    await projectService.removeSelectedFreelancer(id, freelancerId);

    const updatedProject = await projectService.getProjectById(id);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Selected freelancer removed successfully",
      updatedProject,
    );
  }),

  /**
   * Update project details
   */
  updateProject: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Project ID is required" };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // Only client who owns project or admin can update
    if (userRole !== "ADMIN" && project.clientId !== userId) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "You don't have permission to update this project",
      };
    }

    const updatedProject = await projectService.updateProject(id, updateData);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Project updated successfully",
      updatedProject,
    );
  }),

  /**
   * Toggle acceptingBids status for a project
   * Client can toggle their own projects
   * Admin/Moderator can toggle any project
   */
  toggleAcceptingBids: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const { acceptingBids } = req.body;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Project ID is required" };
    }

    if (typeof acceptingBids !== "boolean") {
      throw {
        status: BADREQUESTCODE,
        message: "acceptingBids must be a boolean value",
      };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // Only client who owns project, moderator, or admin can toggle acceptingBids
    if (
      userRole !== "ADMIN" &&
      userRole !== "MODERATOR" &&
      project.clientId !== userId
    ) {
      throw {
        status: UNAUTHORIZEDCODE,
        message:
          "You don't have permission to toggle accepting bids for this project",
      };
    }

    const updatedProject = await projectService.toggleAcceptingBids(
      id,
      acceptingBids,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      acceptingBids
        ? "Project is now accepting bids"
        : "Project is no longer accepting bids",
      updatedProject,
    );
  }),

  /**
   * Delete project (soft delete)
   */
  deleteProject: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const userId = req.userFromToken?.uid;
    const userRole = req.userFromToken?.role;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Project ID is required" };
    }

    const project = await projectService.getProjectById(id);

    if (!project) {
      throw { status: NOTFOUNDCODE, message: "Project not found" };
    }

    // Only client who owns project or admin can delete
    if (userRole !== "ADMIN" && project.clientId !== userId) {
      throw {
        status: UNAUTHORIZEDCODE,
        message: "You don't have permission to delete this project",
      };
    }

    await projectService.deleteProject(id);

    httpResponse(req, res, SUCCESSCODE, "Project deleted successfully", null);
  }),
};
