import {
  BADREQUESTCODE,
  NOTFOUNDCODE,
  SUCCESSCODE,
  SUCCESSMSG,
} from "../../constants";
import { db } from "../../database/db";
import type { TPROJECTBUILDER_CREATE } from "../../types";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import type { _Request } from "../../middlewares/authMiddleware";

export default {
  createProjectBuilder: asyncHandler(async (req, res) => {
    // ** validation is already handled by middleware
    const projectBuilderData = req.body as TPROJECTBUILDER_CREATE;

    // Check if a project with the same name already exists
    const existingProject = await db.projectBuilder.findFirst({
      where: {
        projectName: projectBuilderData.projectName,
        trashedAt: null,
        trashedBy: null,
      },
    });

    if (existingProject) {
      throw {
        status: BADREQUESTCODE,
        message: "A project with this name already exists.",
      };
    }

    // Create the project builder entry
    const createdProjectBuilder = await db.projectBuilder.create({
      data: {
        projectName: projectBuilderData.projectName,
        projectDescription: projectBuilderData.projectDescription,
        projectType: projectBuilderData.projectType,
        technologies: projectBuilderData.technologies,
        features: projectBuilderData.features,
        budget: projectBuilderData.budget ?? null,
        timeline: projectBuilderData.timeline ?? null,
        priority: projectBuilderData.priority || "MEDIUM",
        status: projectBuilderData.status || "DRAFT",
        clientName: projectBuilderData.clientName,
        clientEmail: projectBuilderData.clientEmail,
        clientPhone: projectBuilderData.clientPhone ?? null,
        clientCompany: projectBuilderData.clientCompany ?? null,
        additionalNotes: projectBuilderData.additionalNotes ?? null,
      },
      select: {
        id: true,
        projectName: true,
        projectDescription: true,
        projectType: true,
        technologies: true,
        features: true,
        budget: true,
        timeline: true,
        priority: true,
        status: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        clientCompany: true,
        additionalNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, createdProjectBuilder);
  }),

  // ** Get Single ProjectBuilder By ID
  getSingleProjectBuilder: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id)
      throw { status: BADREQUESTCODE, message: "Project ID is required." };

    const projectBuilder = await db.projectBuilder.findUnique({
      where: {
        id: id,
        trashedAt: null,
        trashedBy: null,
      },
      select: {
        id: true,
        projectName: true,
        projectDescription: true,
        projectType: true,
        technologies: true,
        features: true,
        budget: true,
        timeline: true,
        priority: true,
        status: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        clientCompany: true,
        additionalNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!projectBuilder) {
      throw { status: NOTFOUNDCODE, message: "Project not found." };
    }

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, projectBuilder);
  }),

  // ** Get All ProjectBuilders
  getAllProjectBuilders: asyncHandler(async (req, res) => {
    const { page = "1", limit = "10", status, priority } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const whereClause: {
      trashedAt: null;
      trashedBy: null;
      status?: string;
      priority?: string;
    } = {
      trashedAt: null,
      trashedBy: null,
    };

    if (status) {
      whereClause.status = status as string;
    }

    if (priority) {
      whereClause.priority = priority as string;
    }

    const [projectBuilders, totalCount] = await Promise.all([
      db.projectBuilder.findMany({
        where: whereClause,
        select: {
          id: true,
          projectName: true,
          projectDescription: true,
          projectType: true,
          technologies: true,
          features: true,
          budget: true,
          timeline: true,
          priority: true,
          status: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
          clientCompany: true,
          additionalNotes: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      db.projectBuilder.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      projectBuilders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
      },
    });
  }),

  // ** Update ProjectBuilder
  updateProjectBuilder: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body as Partial<TPROJECTBUILDER_CREATE>;

    if (!id)
      throw { status: BADREQUESTCODE, message: "Project ID is required." };

    // Check if project exists
    const existingProject = await db.projectBuilder.findUnique({
      where: { id: id, trashedAt: null, trashedBy: null },
    });

    if (!existingProject) {
      throw { status: NOTFOUNDCODE, message: "Project not found." };
    }

    // If updating project name, check for duplicates
    if (
      updateData.projectName &&
      updateData.projectName !== existingProject.projectName
    ) {
      const duplicateProject = await db.projectBuilder.findFirst({
        where: {
          projectName: updateData.projectName,
          id: { not: id },
          trashedAt: null,
          trashedBy: null,
        },
      });

      if (duplicateProject) {
        throw {
          status: BADREQUESTCODE,
          message: "A project with this name already exists.",
        };
      }
    }

    // Convert undefined to null for Prisma
    const prismaData: Partial<TPROJECTBUILDER_CREATE> & { updatedAt: Date } = {
      ...updateData,
      updatedAt: new Date(),
    };

    if (prismaData.budget === undefined) prismaData.budget = null;
    if (prismaData.timeline === undefined) prismaData.timeline = null;
    if (prismaData.clientPhone === undefined) prismaData.clientPhone = null;
    if (prismaData.clientCompany === undefined) prismaData.clientCompany = null;
    if (prismaData.additionalNotes === undefined)
      prismaData.additionalNotes = null;

    const updatedProjectBuilder = await db.projectBuilder.update({
      where: { id: id },
      data: prismaData,
      select: {
        id: true,
        projectName: true,
        projectDescription: true,
        projectType: true,
        technologies: true,
        features: true,
        budget: true,
        timeline: true,
        priority: true,
        status: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        clientCompany: true,
        additionalNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, updatedProjectBuilder);
  }),

  // ** Delete ProjectBuilder (Soft Delete)
  deleteProjectBuilder: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const uid = req.userFromToken?.uid;
    if (!uid) throw { status: BADREQUESTCODE, message: "User ID is required." };

    if (!id)
      throw { status: BADREQUESTCODE, message: "Project ID is required." };

    // Check if project exists
    const existingProject = await db.projectBuilder.findUnique({
      where: { id: id, trashedAt: null, trashedBy: null },
    });

    if (!existingProject) {
      throw { status: NOTFOUNDCODE, message: "Project not found." };
    }

    // Soft delete the project
    await db.projectBuilder.update({
      where: { id: id },
      data: {
        trashedAt: new Date(),
        trashedBy: uid,
      },
    });

    httpResponse(req, res, SUCCESSCODE, "Project deleted successfully", null);
  }),
};
