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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const db_1 = require("../../database/db");
const slugStringGeneratorService_1 = require("../../services/slugStringGeneratorService");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const bountyPercentageDividerUtils_1 = require("../../utils/bountyPercentageDividerUtils");
const findUniqueUtils_1 = require("../../utils/findUniqueUtils");
const kpiCalculaterUtils_1 = require("../../utils/kpiCalculaterUtils");
const loggerUtils_1 = __importDefault(require("../../utils/loggerUtils"));
const updateFreelancerRankUtils_1 = require("../../utils/updateFreelancerRankUtils");
exports.default = {
    createInterestedFreelancers: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        const { interestedFreelancerWhoWantToWorkOnThisProject } = req.body;
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        if (!Array.isArray(interestedFreelancerWhoWantToWorkOnThisProject))
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Send The array  of ID's of freelancer who is interested.",
            };
        const updateProject = yield db_1.db.project.update({
            where: { projectSlug: projectSlug },
            data: {
                interestedFreelancers: {
                    connect: interestedFreelancerWhoWantToWorkOnThisProject.map((id) => ({
                        uid: id,
                    })),
                },
            },
            select: {
                interestedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, updateProject);
    })),
    removeFreelancerFromInterestedList: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { projectSlug } = req.params;
        const freelancerUid = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        loggerUtils_1.default.info(freelancerUid);
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        if (!freelancerUid)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Freelancer uid is required.",
            };
        const updatedProject = yield db_1.db.project.update({
            where: { projectSlug: projectSlug },
            data: { interestedFreelancers: { disconnect: { uid: freelancerUid } } },
            select: {
                interestedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        yield db_1.db.user.update({
            where: { uid: freelancerUid },
            data: { kpiRankPoints: { decrement: 10 } },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            message: "Freelancer removed from interested list successfully.",
            updatedProject,
        });
    })),
    listInterestedFreelancersInSingleProject: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        const project = yield db_1.db.project.findUnique({
            where: { projectSlug: projectSlug },
            select: {
                interestedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        if (!project)
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, project.interestedFreelancers);
    })),
    selectFreelancerForProject: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        const { selectedFreelancersForThisProject: freelancerName } = req.body;
        if (!freelancerName)
            throw { status: constants_1.BADREQUESTCODE, message: "Freelancer name is required." };
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        const selectFreeLancer = yield db_1.db.project.update({
            where: { projectSlug: projectSlug },
            data: {
                selectedFreelancers: {
                    connect: freelancerName.map((freelancer) => ({
                        username: freelancer,
                    })),
                },
            },
            select: {
                selectedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, selectFreeLancer);
    })),
    removeSelectedFreelancer: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        const { uid: freelancerUid } = req.body;
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        if (!freelancerUid)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Freelancer username is required.",
            };
        const updatedProject = yield db_1.db.project.update({
            where: { projectSlug: projectSlug },
            data: { selectedFreelancers: { disconnect: [{ uid: freelancerUid }] } },
            select: {
                selectedFreelancers: {
                    select: { uid: true, username: true, fullName: true, email: true },
                },
            },
        });
        yield db_1.db.user.update({
            where: { uid: freelancerUid },
            data: { kpiRankPoints: { decrement: 40 } },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            message: "Freelancer removed from selected list successfully.",
            updatedProject,
        });
    })),
    updateProgressOfProject: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        const { freelancerName } = req.body;
        let { progressPercentage } = req.body;
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        const project = yield (0, findUniqueUtils_1.findUniqueProject)(projectSlug);
        if (!(project === null || project === void 0 ? void 0 : project.selectedFreelancersForThisProject.includes(freelancerName)))
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "You can't update progress of this project since you are not working on this project",
            };
        if (project.projectStatus !== "ONGOING")
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "You can't update progress of completed or pending project",
            };
        if (!project)
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        if (!progressPercentage)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Progress percentage is required.",
            };
        if (isNaN(progressPercentage))
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Progress percentage must be a number.",
            };
        else
            progressPercentage = Number(progressPercentage);
        if (progressPercentage > 100 || progressPercentage < 0)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Progress percentage must be between 0 and 100.",
            };
        if ((project === null || project === void 0 ? void 0 : project.progressPercentage) > progressPercentage)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "You can't update progress backward",
            };
        const updateProgressOfProject = yield db_1.db.project.update({
            where: { projectSlug: projectSlug },
            data: { progressPercentage: Number(progressPercentage) },
        });
        if (updateProgressOfProject.progressPercentage === 100) {
            yield db_1.db.project.update({
                where: { projectSlug: projectSlug },
                data: { projectStatus: "COMPLETED" },
            });
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            progressPercentage: updateProgressOfProject.progressPercentage,
        });
    })),
    changeProjectStatus: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        const { projectStatus } = req.body;
        if (!projectStatus)
            throw { status: constants_1.BADREQUESTCODE, message: "Field is required." };
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        const project = yield db_1.db.project.update({
            where: { projectSlug: projectSlug },
            data: { projectStatus: projectStatus },
        });
        if (!project)
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            projectStatus: project.projectStatus,
        });
    })),
    changeProjectType: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        const { projectType } = req.body;
        if (!projectType)
            throw { status: constants_1.BADREQUESTCODE, message: "Field is required." };
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        const project = yield db_1.db.project.update({
            where: { projectSlug: projectSlug },
            data: { projectType: projectType },
        });
        if (!project)
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            projectType: project.projectType,
        });
    })),
    writeReviewAndGiveRating: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        const { starsByClientAfterProjectCompletion, commentByClientAfterProjectCompletion: review, } = req.body;
        if (!review)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "You can't rate without comment.",
            };
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        const project = yield db_1.db.project.findUnique({
            where: { projectSlug: projectSlug },
        });
        if ((project === null || project === void 0 ? void 0 : project.projectStatus) !== "COMPLETED")
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Project must be completed to give rating.",
            };
        const updatedProject = yield db_1.db.project.update({
            where: { projectSlug: projectSlug },
            data: {
                commentByClientAfterProjectCompletion: review,
                starsByClientAfterProjectCompletion: Number(starsByClientAfterProjectCompletion),
            },
            select: {
                selectedFreelancers: { select: { uid: true, username: true } },
                difficultyLevel: true,
                starsByClientAfterProjectCompletion: true,
            },
        });
        yield Promise.all(updatedProject.selectedFreelancers.map((freelancer) => __awaiter(void 0, void 0, void 0, function* () {
            const kpiRankPoints = yield (0, kpiCalculaterUtils_1.calculateKpiPoints)({
                uid: freelancer.uid,
                difficulty: updatedProject.difficultyLevel,
                rating: updatedProject.starsByClientAfterProjectCompletion || 0,
            });
            yield (0, updateFreelancerRankUtils_1.updateFreelancerRank)(freelancer.uid, kpiRankPoints);
        })));
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    updateProjectBySlug: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        const updatedData = req.body;
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        const deadLineDate = new Date(updatedData.deadline);
        if (isNaN(deadLineDate.getTime()))
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid deadline date." };
        if (deadLineDate < new Date())
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Deadline must be a future date.",
            };
        const project = yield db_1.db.project.update({
            where: { projectSlug: projectSlug },
            data: Object.assign(Object.assign({}, updatedData), { projectSlug: (0, slugStringGeneratorService_1.generateSlug)(updatedData.title), bounty: (0, bountyPercentageDividerUtils_1.calculate90Percent)(updatedData.bounty), deadline: deadLineDate }),
        });
        if (!project)
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, { project });
    })),
    makeProjectOutsource: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { projectSlug } = req.params;
        if (!projectSlug)
            throw { status: constants_1.BADREQUESTCODE, message: "Project slug is required." };
        const project = yield db_1.db.project.findUnique({
            where: { projectSlug: projectSlug },
            select: { bounty: true, projectType: true },
        });
        if (!project)
            throw { status: constants_1.NOTFOUNDCODE, message: "Project not found." };
        if (project.projectType === "OUTSOURCE") {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Project is already outsource.",
            };
        }
        yield db_1.db.project.update({
            where: { projectSlug: projectSlug },
            data: {
                projectType: "OUTSOURCE",
                bounty: (0, bountyPercentageDividerUtils_1.calculate90Percent)((project === null || project === void 0 ? void 0 : project.bounty) || 0),
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, { project });
    })),
};
