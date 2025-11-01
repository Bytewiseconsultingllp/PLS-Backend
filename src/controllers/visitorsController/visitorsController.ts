import {
  BADREQUESTCODE,
  NOTFOUNDCODE,
  SUCCESSCODE,
  SUCCESSMSG,
} from "../../constants";
import { db } from "../../database/db";
import type { TVISITORS_CREATE } from "../../types";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import type { _Request } from "../../middlewares/authMiddleware";

export default {
  createVisitor: asyncHandler(async (req, res) => {
    // ** validation is already handled by middleware
    const visitorData = req.body as TVISITORS_CREATE;

    // Check if a visitor with the same business email already exists
    const existingVisitor = await db.visitors.findFirst({
      where: {
        businessEmail: visitorData.businessEmail,
        trashedAt: null,
        trashedBy: null,
      },
    });

    if (existingVisitor) {
      throw {
        status: BADREQUESTCODE,
        message: "A visitor with this business email already exists.",
      };
    }

    // Create the visitor entry
    const createdVisitor = await db.visitors.create({
      data: {
        fullName: visitorData.fullName,
        businessEmail: visitorData.businessEmail,
        phoneNumber: visitorData.phoneNumber ?? null,
        companyName: visitorData.companyName ?? null,
        companyWebsite: visitorData.companyWebsite ?? null,
        businessAddress: visitorData.businessAddress,
        businessType: visitorData.businessType,
        referralSource: visitorData.referralSource,
      },
      select: {
        id: true,
        fullName: true,
        businessEmail: true,
        phoneNumber: true,
        companyName: true,
        companyWebsite: true,
        businessAddress: true,
        businessType: true,
        referralSource: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, createdVisitor);
  }),

  // ** Get All Visitors
  getAllVisitors: asyncHandler(async (req, res) => {
    const {
      page = "1",
      limit = "10",
      businessType,
      referralSource,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const whereClause: {
      trashedAt: null;
      trashedBy: null;
      businessType?: string;
      referralSource?: string;
    } = {
      trashedAt: null,
      trashedBy: null,
    };

    if (businessType) {
      whereClause.businessType = businessType as string;
    }

    if (referralSource) {
      whereClause.referralSource = referralSource as string;
    }

    const [visitors, totalCount] = await Promise.all([
      db.visitors.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          businessEmail: true,
          phoneNumber: true,
          companyName: true,
          companyWebsite: true,
          businessAddress: true,
          businessType: true,
          referralSource: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      db.visitors.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      visitors,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
      },
    });
  }),

  // ** Get Single Visitor by ID
  getSingleVisitor: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id)
      throw { status: BADREQUESTCODE, message: "Visitor ID is required." };

    const visitor = await db.visitors.findUnique({
      where: {
        id: id,
        trashedAt: null,
        trashedBy: null,
      },
      select: {
        id: true,
        fullName: true,
        businessEmail: true,
        phoneNumber: true,
        companyName: true,
        companyWebsite: true,
        businessAddress: true,
        businessType: true,
        referralSource: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found." };
    }

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, visitor);
  }),

  // ** Update Visitor
  updateVisitor: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body as Partial<TVISITORS_CREATE>;

    if (!id)
      throw { status: BADREQUESTCODE, message: "Visitor ID is required." };

    // Check if visitor exists
    const existingVisitor = await db.visitors.findUnique({
      where: { id: id, trashedAt: null, trashedBy: null },
    });

    if (!existingVisitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found." };
    }

    // If updating business email, check for duplicates
    if (
      updateData.businessEmail &&
      updateData.businessEmail !== existingVisitor.businessEmail
    ) {
      const duplicateVisitor = await db.visitors.findFirst({
        where: {
          businessEmail: updateData.businessEmail,
          id: { not: id },
          trashedAt: null,
          trashedBy: null,
        },
      });

      if (duplicateVisitor) {
        throw {
          status: BADREQUESTCODE,
          message: "A visitor with this business email already exists.",
        };
      }
    }

    // Convert undefined to null for Prisma
    const prismaData: Partial<TVISITORS_CREATE> & { updatedAt: Date } = {
      ...updateData,
      updatedAt: new Date(),
    };

    if (prismaData.phoneNumber === undefined) prismaData.phoneNumber = null;
    if (prismaData.companyName === undefined) prismaData.companyName = null;
    if (prismaData.companyWebsite === undefined)
      prismaData.companyWebsite = null;

    const updatedVisitor = await db.visitors.update({
      where: { id: id },
      data: prismaData,
      select: {
        id: true,
        fullName: true,
        businessEmail: true,
        phoneNumber: true,
        companyName: true,
        companyWebsite: true,
        businessAddress: true,
        businessType: true,
        referralSource: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, updatedVisitor);
  }),

  // ** Delete Visitor (Soft Delete)
  deleteVisitor: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const uid = req.userFromToken?.uid;
    if (!uid) throw { status: BADREQUESTCODE, message: "User ID is required." };

    if (!id)
      throw { status: BADREQUESTCODE, message: "Visitor ID is required." };

    // Check if visitor exists
    const existingVisitor = await db.visitors.findUnique({
      where: { id: id, trashedAt: null, trashedBy: null },
    });

    if (!existingVisitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found." };
    }

    // Soft delete the visitor
    await db.visitors.update({
      where: { id: id },
      data: {
        trashedAt: new Date(),
        trashedBy: uid,
      },
    });

    httpResponse(req, res, SUCCESSCODE, "Visitor deleted successfully", null);
  }),
};
