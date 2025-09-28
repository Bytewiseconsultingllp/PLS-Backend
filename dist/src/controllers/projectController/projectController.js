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
const slugStringGeneratorService_1 = require("../../services/slugStringGeneratorService");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
exports.default = {
    createProject: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const projectData = req.body;
        let deadline = projectData.deadline;
        if (deadline.length === 16) {
            deadline += ":00.000Z";
        }
        else if (deadline.length === 19) {
            deadline += ".000Z";
        }
        else if (deadline.length === 23) {
            deadline += "Z";
        }
        else if (deadline.length !== 25) {
            throw { status: constants_1.BADREQUESTCODE, message: "Please enter a valid date" };
        }
        const newDeadLine = new Date(deadline);
        if (isNaN(newDeadLine.getTime())) {
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid date format." };
        }
        if (newDeadLine < new Date()) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Deadline must be in the future.",
            };
        }
        const projectSlug = (0, slugStringGeneratorService_1.generateSlug)(projectData.title);
        const niche = (0, slugStringGeneratorService_1.generateSlug)(projectData.niche);
        const clientWhoPostedThisProjectForeignIdExists = yield db_1.db.user.findUnique({
            where: { uid: projectData.clientWhoPostedThisProjectForeignId || "" },
        });
        if (!clientWhoPostedThisProjectForeignIdExists)
            throw { status: constants_1.BADREQUESTCODE, message: "Client id does not exist." };
        const isProjectAlreadyExist = yield db_1.db.project.findUnique({
            where: { projectSlug: projectSlug, title: projectData.title },
        });
        if (isProjectAlreadyExist) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Project already exist with same title.",
            };
        }
        if (!projectData.clientWhoPostedThisProjectForeignId)
            throw { status: constants_1.BADREQUESTCODE, message: "Client id is required." };
        const createdProject = yield db_1.db.project.create({
            data: {
                title: projectData.title,
                detail: projectData.detail,
                bounty: projectData.bounty,
                deadline: newDeadLine,
                niche: niche,
                projectSlug: projectSlug,
                difficultyLevel: "EASY",
                progressPercentage: 0,
                projectStatus: "PENDING",
                clientWhoPostedThisProjectForeignId: projectData.clientWhoPostedThisProjectForeignId,
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
                clientWhoPostedThisProject: {
                    select: { username: true, uid: true, fullName: true, email: true },
                },
                interestedFreelancers: {
                    select: { username: true, uid: true, fullName: true, email: true },
                },
                selectedFreelancers: {
                    select: { username: true, uid: true, fullName: true, email: true },
                },
                projectSlug: true,
                projectStatus: true,
                createdAt: true,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, createdProject);
    })),
    getSingleProject: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        const project = yield db_1.db.project.findUnique({
            where: { projectSlug: projectSlug, trashedAt: null, trashedBy: null },
            select: {
                id: true,
                title: true,
                detail: true,
                deadline: true,
                bounty: true,
                progressPercentage: true,
                niche: true,
                difficultyLevel: true,
                clientWhoPostedThisProject: {
                    select: { username: true, uid: true, fullName: true, email: true },
                },
                interestedFreelancers: {
                    select: {
                        username: true,
                        uid: true,
                        fullName: true,
                        email: true,
                        niche: true,
                        portfolioUrl: true,
                        kpiRankPoints: true,
                        kpiRank: true,
                    },
                },
                selectedFreelancers: {
                    select: { username: true, uid: true, fullName: true, email: true },
                },
                commentByClientAfterProjectCompletion: true,
                starsByClientAfterProjectCompletion: true,
                projectSlug: true,
                projectStatus: true,
                projectType: true,
                createdAt: true,
            },
        });
        if (!project)
            throw { status: constants_1.BADREQUESTCODE, message: "Project not found." };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, project);
    })),
    deleteProject: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        yield db_1.db.project
            .findUniqueOrThrow({ where: { id: Number(id) } })
            .then((res) => res)
            .catch(() => {
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        });
        const project = yield db_1.db.project.delete({ where: { id: Number(id) } });
        if (project)
            throw { status: constants_1.BADREQUESTCODE, message: "Project not found." };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, null);
    })),
};
