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
    createProjectBuilder: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const projectBuilderData = req.body;
        const existingProject = yield db_1.db.projectBuilder.findFirst({
            where: {
                projectName: projectBuilderData.projectName,
                trashedAt: null,
                trashedBy: null,
            },
        });
        if (existingProject) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "A project with this name already exists.",
            };
        }
        const createdProjectBuilder = yield db_1.db.projectBuilder.create({
            data: {
                projectName: projectBuilderData.projectName,
                projectDescription: projectBuilderData.projectDescription,
                projectType: projectBuilderData.projectType,
                technologies: projectBuilderData.technologies,
                features: projectBuilderData.features,
                budget: (_a = projectBuilderData.budget) !== null && _a !== void 0 ? _a : null,
                timeline: (_b = projectBuilderData.timeline) !== null && _b !== void 0 ? _b : null,
                priority: projectBuilderData.priority || "MEDIUM",
                status: projectBuilderData.status || "DRAFT",
                clientName: projectBuilderData.clientName,
                clientEmail: projectBuilderData.clientEmail,
                clientPhone: (_c = projectBuilderData.clientPhone) !== null && _c !== void 0 ? _c : null,
                clientCompany: (_d = projectBuilderData.clientCompany) !== null && _d !== void 0 ? _d : null,
                additionalNotes: (_e = projectBuilderData.additionalNotes) !== null && _e !== void 0 ? _e : null,
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
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, createdProjectBuilder);
    })),
    getSingleProjectBuilder: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Project ID is required." };
        const projectBuilder = yield db_1.db.projectBuilder.findUnique({
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
                interestedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
                selectedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        if (!projectBuilder) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, projectBuilder);
    })),
    getAllProjectBuilders: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { page = "1", limit = "10", status, priority } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const whereClause = {
            trashedAt: null,
            trashedBy: null,
        };
        if (status) {
            whereClause.status = status;
        }
        if (priority) {
            whereClause.priority = priority;
        }
        const [projectBuilders, totalCount] = yield Promise.all([
            db_1.db.projectBuilder.findMany({
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
                    interestedFreelancers: {
                        select: { uid: true, username: true, fullName: true, email: true },
                    },
                    selectedFreelancers: {
                        select: { uid: true, username: true, fullName: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
            }),
            db_1.db.projectBuilder.count({ where: whereClause }),
        ]);
        const totalPages = Math.ceil(totalCount / limitNum);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            projectBuilders,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
            },
        });
    })),
    updateProjectBuilder: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const updateData = req.body;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Project ID is required." };
        const existingProject = yield db_1.db.projectBuilder.findUnique({
            where: { id: id, trashedAt: null, trashedBy: null },
        });
        if (!existingProject) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        }
        if (updateData.projectName &&
            updateData.projectName !== existingProject.projectName) {
            const duplicateProject = yield db_1.db.projectBuilder.findFirst({
                where: {
                    projectName: updateData.projectName,
                    id: { not: id },
                    trashedAt: null,
                    trashedBy: null,
                },
            });
            if (duplicateProject) {
                throw {
                    status: constants_1.BADREQUESTCODE,
                    message: "A project with this name already exists.",
                };
            }
        }
        const prismaData = Object.assign(Object.assign({}, updateData), { updatedAt: new Date() });
        if (prismaData.budget === undefined)
            prismaData.budget = null;
        if (prismaData.timeline === undefined)
            prismaData.timeline = null;
        if (prismaData.clientPhone === undefined)
            prismaData.clientPhone = null;
        if (prismaData.clientCompany === undefined)
            prismaData.clientCompany = null;
        if (prismaData.additionalNotes === undefined)
            prismaData.additionalNotes = null;
        const updatedProjectBuilder = yield db_1.db.projectBuilder.update({
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
                interestedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
                selectedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, updatedProjectBuilder);
    })),
    deleteProjectBuilder: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        const uid = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        if (!uid)
            throw { status: constants_1.BADREQUESTCODE, message: "User ID is required." };
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Project ID is required." };
        const existingProject = yield db_1.db.projectBuilder.findUnique({
            where: { id: id, trashedAt: null, trashedBy: null },
        });
        if (!existingProject) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        }
        yield db_1.db.projectBuilder.update({
            where: { id: id },
            data: {
                trashedAt: new Date(),
                trashedBy: uid,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Project deleted successfully", null);
    })),
    addInterestedFreelancers: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { interestedFreelancerIds } = req.body;
        if (!id) {
            throw { status: constants_1.BADREQUESTCODE, message: "Project ID is required." };
        }
        if (!Array.isArray(interestedFreelancerIds)) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Send an array of freelancer IDs who are interested.",
            };
        }
        const existingProject = yield db_1.db.projectBuilder.findUnique({
            where: { id: id, trashedAt: null, trashedBy: null },
        });
        if (!existingProject) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        }
        const updatedProject = yield db_1.db.projectBuilder.update({
            where: { id: id },
            data: {
                interestedFreelancers: {
                    connect: interestedFreelancerIds.map((freelancerId) => ({
                        uid: freelancerId,
                    })),
                },
            },
            select: {
                id: true,
                projectName: true,
                interestedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, updatedProject);
    })),
    removeInterestedFreelancer: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { freelancerUid } = req.body;
        if (!id) {
            throw { status: constants_1.BADREQUESTCODE, message: "Project ID is required." };
        }
        if (!freelancerUid) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Freelancer UID is required.",
            };
        }
        const existingProject = yield db_1.db.projectBuilder.findUnique({
            where: { id: id, trashedAt: null, trashedBy: null },
        });
        if (!existingProject) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        }
        const updatedProject = yield db_1.db.projectBuilder.update({
            where: { id: id },
            data: {
                interestedFreelancers: {
                    disconnect: { uid: freelancerUid },
                },
            },
            select: {
                id: true,
                projectName: true,
                interestedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, updatedProject);
    })),
    selectFreelancers: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { selectedFreelancerIds } = req.body;
        if (!id) {
            throw { status: constants_1.BADREQUESTCODE, message: "Project ID is required." };
        }
        if (!Array.isArray(selectedFreelancerIds)) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Send an array of freelancer IDs to select.",
            };
        }
        const existingProject = yield db_1.db.projectBuilder.findUnique({
            where: { id: id, trashedAt: null, trashedBy: null },
        });
        if (!existingProject) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        }
        const updatedProject = yield db_1.db.projectBuilder.update({
            where: { id: id },
            data: {
                selectedFreelancers: {
                    connect: selectedFreelancerIds.map((freelancerId) => ({
                        uid: freelancerId,
                    })),
                },
            },
            select: {
                id: true,
                projectName: true,
                selectedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, updatedProject);
    })),
    removeSelectedFreelancer: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { freelancerUid } = req.body;
        if (!id) {
            throw { status: constants_1.BADREQUESTCODE, message: "Project ID is required." };
        }
        if (!freelancerUid) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Freelancer UID is required.",
            };
        }
        const existingProject = yield db_1.db.projectBuilder.findUnique({
            where: { id: id, trashedAt: null, trashedBy: null },
        });
        if (!existingProject) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        }
        const updatedProject = yield db_1.db.projectBuilder.update({
            where: { id: id },
            data: {
                selectedFreelancers: {
                    disconnect: { uid: freelancerUid },
                },
            },
            select: {
                id: true,
                projectName: true,
                selectedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            message: "Freelancer removed from selected list successfully.",
            updatedProject,
        });
    })),
    getProjectBuilderWithFreelancers: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id) {
            throw { status: constants_1.BADREQUESTCODE, message: "Project ID is required." };
        }
        const projectBuilder = yield db_1.db.projectBuilder.findUnique({
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
                interestedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
                selectedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        if (!projectBuilder) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, projectBuilder);
    })),
};
