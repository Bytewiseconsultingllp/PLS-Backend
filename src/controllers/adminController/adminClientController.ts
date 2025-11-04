import type { Request, Response } from "express";
import adminClientService from "../../services/adminClientService";
import { SUCCESSCODE, BADREQUESTCODE } from "../../constants";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import { httpResponse } from "../../utils/apiResponseUtils";

// ============================================
// ADMIN CLIENT MANAGEMENT CONTROLLERS
// ============================================

/**
 * GET /api/admin/clients
 * Get all clients with pagination and search
 * Requires authentication - admin role only
 */
export const getAllClients = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, searchQuery } = req.query;

    const result = await adminClientService.getAllClients({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      searchQuery: searchQuery as string,
    });

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Clients retrieved successfully",
      result,
    );
  },
);

/**
 * GET /api/admin/clients/:clientId
 * Get comprehensive client details with all projects, payments, KPI, and visitor data
 * Requires authentication - admin role only
 */
export const getClientById = asyncHandler(
  async (req: Request, res: Response) => {
    const { clientId } = req.params;

    if (!clientId) {
      throw { status: BADREQUESTCODE, message: "Client ID is required" };
    }

    const client = await adminClientService.getClientById(clientId);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Client details retrieved successfully",
      client,
    );
  },
);

/**
 * GET /api/admin/clients/stats
 * Get client statistics
 * Requires authentication - admin role only
 */
export const getClientStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await adminClientService.getClientStats();

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Client statistics retrieved successfully",
      stats,
    );
  },
);

export default {
  getAllClients,
  getClientById,
  getClientStats,
};
