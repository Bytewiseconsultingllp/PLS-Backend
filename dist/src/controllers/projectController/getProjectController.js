"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const db_1 = require("../../database/db");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
exports.default = {
    getAllProjectsWithThierClient: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { clientId } = req.params;
        const { page = "1", limit = "10" } = req.query;
        if (!clientId)
            throw { status: constants_1.BADREQUESTCODE, message: "Client id is required" };
        const client = yield db_1.db.user.findFirst({
            where: {
                uid: clientId,
            },
        });
        if (!client) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Client not found" };
        }
        const pageNumber = Number(page);
        const pageLimit = Number(limit);
        if (isNaN(pageNumber) ||
            isNaN(pageLimit) ||
            pageNumber <= 0 ||
            pageLimit <= 0) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Invalid pagination parameters!!",
            };
        }
        const skip = (pageNumber - 1) * pageLimit;
        const take = pageLimit;
        const projects = yield db_1.db.project.findMany({
            where: {
                clientWhoPostedThisProjectForeignId: clientId,
                trashedAt: null,
                trashedBy: null,
            },
            skip,
            take,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                title: true,
                detail: true,
                deadline: true,
                bounty: true,
                progressPercentage: true,
                niche: true,
                difficultyLevel: true,
                projectType: true,
                projectStatus: true,
                projectSlug: true,
                createdAt: true,
                milestones: true,
                clientWhoPostedThisProject: {
                    select: {
                        uid: true,
                        fullName: true,
                        email: true,
                        username: true,
                    },
                },
            },
        });
        const totalProjects = yield db_1.db.project.count({
            where: {
                clientWhoPostedThisProjectForeignId: clientId,
                trashedAt: null,
                trashedBy: null,
            },
        });
        const totalPages = Math.ceil(totalProjects / pageLimit);
        const hasNextPage = totalPages > pageNumber;
        const hasPreviousPage = pageNumber > 1;
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            projects,
            pagination: {
                totalPages,
                totalProjects,
                currentPage: pageNumber,
                hasPreviousPage,
                hasNextPage,
            },
        });
    })),
    getAllProjects: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { page = "1", limit = "10", difficultyLevel, nicheName = "", projectType = "", projectStatus = "", } = req.query;
        let { createdAtOrder = "latest", bountyOrder = "" } = req.query;
        const pageNum = Number(page || 10);
        const pageSize = Number(limit || 10);
        const skip = (pageNum - 1) * pageSize;
        const filters = {
            trashedAt: null,
            trashedBy: null,
        };
        if (difficultyLevel) {
            filters.difficultyLevel = difficultyLevel;
        }
        if (nicheName) {
            filters.niche = nicheName;
        }
        if (projectType) {
            filters.projectType = projectType;
        }
        if (projectStatus) {
            filters.projectStatus = projectStatus;
        }
        const orderBy = [];
        if (createdAtOrder) {
            bountyOrder = "";
            orderBy.push({
                createdAt: createdAtOrder === "latest" ? "desc" : "asc",
            });
        }
        if (bountyOrder) {
            createdAtOrder = "";
            orderBy.push({
                bounty: bountyOrder === "highest" ? "desc" : "asc",
            });
        }
        const projects = yield db_1.db.project.findMany({
            where: Object.assign({}, filters),
            skip,
            take: pageSize,
            orderBy: orderBy,
            select: {
                id: true,
                title: true,
                detail: true,
                deadline: true,
                bounty: true,
                progressPercentage: true,
                niche: true,
                difficultyLevel: true,
                milestones: true,
                projectType: true,
                projectStatus: true,
                projectSlug: true,
                createdAt: true,
            },
        });
        const totalProjects = yield db_1.db.project.count({ where: Object.assign({}, filters) });
        const response = {
            projects,
            pagination: {
                page: pageNum,
                limit: pageSize,
                totalPages: Math.ceil(totalProjects / pageSize),
                totalProjects,
            },
        };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, response);
    })),
    getProjectForSelectedFreelancers: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const id = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "user id is required" };
        const { page = "1", limit = "10" } = req.query;
        const pageNumber = Number(page);
        const pageLimit = Number(limit);
        if (isNaN(pageNumber) ||
            isNaN(pageLimit) ||
            pageNumber <= 0 ||
            pageLimit <= 0) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Invalid pagination parameters",
            };
        }
        const skip = (pageNumber - 1) * pageLimit;
        const take = pageLimit;
        const projects = yield db_1.db.project.findMany({
            where: {
                selectedFreelancers: { some: { uid: id } },
                projectStatus: "ONGOING",
                trashedAt: null,
                trashedBy: null,
            },
            skip,
            take,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                title: true,
                detail: true,
                deadline: true,
                milestones: true,
                bounty: true,
                progressPercentage: true,
                niche: true,
                difficultyLevel: true,
                projectType: true,
                projectStatus: true,
                projectSlug: true,
                createdAt: true,
            },
        });
        const totalProjects = yield db_1.db.project.count({
            where: {
                selectedFreelancers: { some: { uid: id } },
                trashedAt: null,
                trashedBy: null,
            },
        });
        const totalPages = Math.ceil(totalProjects / pageLimit);
        const hasNextPage = totalPages > pageNumber;
        const hasPreviousPage = pageNumber > 1;
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            projects,
            pagination: {
                totalPages,
                totalProjects,
                currentPage: pageNumber,
                hasPreviousPage,
                hasNextPage,
            },
        });
    })),
    getAllOutsourcedProjects: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { page = "1", limit = "10", difficultyLevel, createdAtOrder = "latest", bountyOrder = "lowest", nicheName = "", } = req.query;
        const pageNum = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNum - 1) * pageSize;
        const filters = {
            trashedAt: null,
            trashedBy: null,
            projectType: "OUTSOURCE",
            projectStatus: "PENDING",
        };
        if (difficultyLevel) {
            filters.difficultyLevel = difficultyLevel;
        }
        if (nicheName) {
            filters.niche = nicheName;
        }
        const orderBy = [];
        orderBy.push({
            createdAt: createdAtOrder ? "desc" : "asc",
        });
        orderBy.push({
            bounty: bountyOrder ? "desc" : "asc",
        });
        const projects = yield db_1.db.project.findMany({
            where: Object.assign({}, filters),
            skip,
            take: pageSize,
            orderBy: orderBy,
            select: {
                id: true,
                title: true,
                detail: true,
                milestones: true,
                deadline: true,
                bounty: true,
                progressPercentage: true,
                niche: true,
                difficultyLevel: true,
                projectType: true,
                projectStatus: true,
                projectSlug: true,
                createdAt: true,
            },
        });
        const totalProjects = yield db_1.db.project.count({ where: Object.assign({}, filters) });
        const response = {
            projects,
            pagination: {
                page: pageNum,
                limit: pageSize,
                totalPages: Math.ceil(totalProjects / pageSize),
                totalProjects,
            },
        };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, response);
    })),
};
