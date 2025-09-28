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
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const db_1 = require("../../database/db");
const throwErrorUtils_1 = __importDefault(require("../../utils/throwErrorUtils"));
const constants_1 = require("../../constants");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const updateProjectProgressUtils_1 = require("../../utils/updateProjectProgressUtils");
exports.default = {
    createSingleProjectMilestone: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const milestoneData = req.body;
        const projectId = req.params.projectId;
        if (!projectId)
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
        const project = yield db_1.db.project.findUnique({
            where: { id: Number(projectId) },
        });
        if (!project)
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
        const milestone = yield db_1.db.milestone.findUnique({
            where: { mileStoneName: milestoneData.mileStoneName },
        });
        if (milestone)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Milestone already exists");
        const existingMilestones = yield db_1.db.milestone.findMany({
            where: { projectId: Number(projectId) },
        });
        if (!existingMilestones)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Failed to fetch existing milestones");
        const deadline = new Date(milestoneData.deadline);
        if (!deadline)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Invalid deadline");
        if (isNaN(deadline.getTime())) {
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid date format." };
        }
        if (deadline < new Date())
            throw { status: constants_1.BADREQUESTCODE, message: "Please enter a future date" };
        const allMilestones = [
            ...existingMilestones,
            Object.assign(Object.assign({}, milestoneData), { projectId: Number(projectId) }),
        ];
        const updatedMilestones = (0, updateProjectProgressUtils_1.distributeMilestonePoints)(allMilestones);
        if (!updatedMilestones || updatedMilestones.length === 0) {
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Failed to distribute milestone points");
        }
        const newMilestoneIndex = existingMilestones.length;
        const newTotalPoints = ((_a = updatedMilestones[newMilestoneIndex]) === null || _a === void 0 ? void 0 : _a.totalProgressPoints) || 100;
        yield db_1.db.milestone.create({
            data: Object.assign(Object.assign({}, milestoneData), { projectId: Number(projectId), deadline: deadline, totalProgressPoints: newTotalPoints }),
        });
        for (let i = 0; i < existingMilestones.length; i++) {
            if (!existingMilestones[i] || !((_b = existingMilestones[i]) === null || _b === void 0 ? void 0 : _b.id))
                continue;
            const updatedPoints = ((_c = updatedMilestones[i]) === null || _c === void 0 ? void 0 : _c.totalProgressPoints) || 0;
            yield db_1.db.milestone.update({
                where: { id: Number((_d = existingMilestones[i]) === null || _d === void 0 ? void 0 : _d.id) },
                data: { totalProgressPoints: updatedPoints },
            });
        }
        yield (0, updateProjectProgressUtils_1.updateProjectProgress)(Number(projectId));
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.CREATEDCODE, "Project Milestone created successfully");
    })),
    createMultipleMileStones: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const milestoneData = req.body;
        const projectId = req.params.projectId;
        if (!projectId)
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
        if (!milestoneData || milestoneData.length === 0)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "No milestone data provided");
        const mileStoneNames = milestoneData
            .map((milestone) => milestone.mileStoneName)
            .filter(Boolean);
        if (mileStoneNames.length === 0)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Invalid milestone names");
        const existingMilestones = yield db_1.db.milestone.findMany({
            where: { mileStoneName: { in: mileStoneNames } },
        });
        if (existingMilestones && existingMilestones.length > 0)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Milestone already exists");
        const project = yield db_1.db.project.findUnique({
            where: { id: Number(projectId) },
        });
        if (!project)
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
        const projectMilestones = yield db_1.db.milestone.findMany({
            where: { projectId: Number(projectId) },
        });
        if (!projectMilestones)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Failed to fetch existing milestones");
        const allMilestones = [
            ...projectMilestones,
            ...milestoneData.map((milestone) => (Object.assign(Object.assign({}, milestone), { projectId: Number(projectId) }))),
        ];
        const updatedMilestones = (0, updateProjectProgressUtils_1.distributeMilestonePoints)(allMilestones);
        if (!updatedMilestones || updatedMilestones.length === 0) {
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Failed to distribute milestone points");
        }
        const startIndex = projectMilestones.length;
        const newMilestonesWithPoints = milestoneData.map((milestone, index) => {
            var _a;
            const updatedIndex = startIndex + index;
            const points = ((_a = updatedMilestones[updatedIndex]) === null || _a === void 0 ? void 0 : _a.totalProgressPoints) ||
                Math.floor(100 / milestoneData.length);
            return Object.assign(Object.assign({}, milestone), { projectId: Number(projectId), totalProgressPoints: points });
        });
        yield db_1.db.milestone.createMany({ data: newMilestonesWithPoints });
        for (let i = 0; i < projectMilestones.length; i++) {
            if (!projectMilestones[i] || !((_a = projectMilestones[i]) === null || _a === void 0 ? void 0 : _a.id))
                continue;
            const updatedPoints = ((_b = updatedMilestones[i]) === null || _b === void 0 ? void 0 : _b.totalProgressPoints) || 0;
            yield db_1.db.milestone.update({
                where: { id: Number((_c = projectMilestones[i]) === null || _c === void 0 ? void 0 : _c.id) },
                data: { totalProgressPoints: updatedPoints },
            });
        }
        yield (0, updateProjectProgressUtils_1.updateProjectProgress)(Number(projectId));
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.CREATEDCODE, "Project Milestones created successfully");
    })),
    updateMileStone: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const milestoneData = req.body;
        const milestoneId = req.params.milestoneId;
        if (!milestoneId)
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
        const milestone = yield db_1.db.milestone.findUnique({
            where: { id: Number(milestoneId) },
        });
        if (!milestone)
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
        const deadline = new Date(milestoneData.deadline);
        if (!deadline)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Invalid deadline");
        if (isNaN(deadline.getTime())) {
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid date format." };
        }
        if (deadline < new Date())
            throw { status: constants_1.BADREQUESTCODE, message: "Please enter a future date" };
        const updateData = {
            mileStoneName: milestoneData.mileStoneName,
            description: milestoneData.description,
            deadline: deadline,
            priorityRank: milestoneData.priorityRank,
        };
        yield db_1.db.milestone.update({
            where: { id: Number(milestoneId) },
            data: updateData,
        });
        if (milestoneData.priorityRank !== undefined &&
            milestoneData.priorityRank !== (milestone === null || milestone === void 0 ? void 0 : milestone.priorityRank) &&
            (milestone === null || milestone === void 0 ? void 0 : milestone.projectId)) {
            const projectMilestones = yield db_1.db.milestone.findMany({
                where: { projectId: milestone.projectId },
            });
            if (!projectMilestones || projectMilestones.length === 0) {
                (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Failed to fetch project milestones");
            }
            const updatedMilestones = (0, updateProjectProgressUtils_1.distributeMilestonePoints)(projectMilestones);
            if (!updatedMilestones || updatedMilestones.length === 0) {
                (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Failed to redistribute milestone points");
            }
            for (let i = 0; i < projectMilestones.length; i++) {
                if (!projectMilestones[i] || !((_a = projectMilestones[i]) === null || _a === void 0 ? void 0 : _a.id))
                    continue;
                const updatedPoints = ((_b = updatedMilestones[i]) === null || _b === void 0 ? void 0 : _b.totalProgressPoints) || 0;
                yield db_1.db.milestone.update({
                    where: { id: Number((_c = projectMilestones[i]) === null || _c === void 0 ? void 0 : _c.id) },
                    data: { totalProgressPoints: updatedPoints },
                });
            }
        }
        if (milestone === null || milestone === void 0 ? void 0 : milestone.projectId) {
            yield (0, updateProjectProgressUtils_1.updateProjectProgress)(Number(milestone.projectId));
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.CREATEDCODE, "Project Milestone updated successfully");
    })),
    deleteMileStone: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const milestoneId = req.params.milestoneId;
        if (!milestoneId)
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
        const milestone = yield db_1.db.milestone.findUnique({
            where: { id: Number(milestoneId) },
        });
        if (!milestone)
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
        const projectId = milestone === null || milestone === void 0 ? void 0 : milestone.projectId;
        if (!projectId)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Invalid project ID in milestone");
        yield db_1.db.milestone.delete({ where: { id: Number(milestoneId) } });
        const remainingMilestones = yield db_1.db.milestone.findMany({
            where: { projectId: Number(projectId) },
        });
        if (!remainingMilestones) {
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Failed to fetch remaining milestones");
            return;
        }
        if (remainingMilestones && remainingMilestones.length > 0) {
            const updatedMilestones = (0, updateProjectProgressUtils_1.distributeMilestonePoints)(remainingMilestones);
            if (!updatedMilestones || updatedMilestones.length === 0) {
                (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Failed to redistribute milestone points");
            }
            for (let i = 0; i < remainingMilestones.length; i++) {
                if (!remainingMilestones[i] || !((_a = remainingMilestones[i]) === null || _a === void 0 ? void 0 : _a.id))
                    continue;
                const updatedPoints = ((_b = updatedMilestones[i]) === null || _b === void 0 ? void 0 : _b.totalProgressPoints) || 0;
                yield db_1.db.milestone.update({
                    where: { id: Number((_c = remainingMilestones[i]) === null || _c === void 0 ? void 0 : _c.id) },
                    data: { totalProgressPoints: updatedPoints },
                });
            }
        }
        yield (0, updateProjectProgressUtils_1.updateProjectProgress)(Number(projectId));
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.CREATEDCODE, "Project Milestone deleted successfully");
    })),
    completeMileStone: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const milestoneId = req.params.milestoneId;
        if (!milestoneId)
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
        const milestone = yield db_1.db.milestone.findUnique({
            where: { id: Number(milestoneId) },
        });
        if (!milestone) {
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
            return;
        }
        const projectId = milestone.projectId;
        if (!projectId)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Invalid project ID in milestone");
        yield db_1.db.milestone.update({
            where: { id: Number(milestoneId) },
            data: {
                isMilestoneCompleted: true,
                progress: milestone.totalProgressPoints,
            },
        });
        yield (0, updateProjectProgressUtils_1.updateProjectProgress)(projectId);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.CREATEDCODE, "Project Milestone completed successfully");
    })),
    updateMilestoneProgress: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const milestoneId = req.params.milestoneId;
        const { progress } = req.body;
        if (!milestoneId)
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
        if (progress === undefined || progress === null)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Progress value is required");
        const milestone = yield db_1.db.milestone.findUnique({
            where: { id: Number(milestoneId) },
        });
        if (!milestone) {
            (0, throwErrorUtils_1.default)(constants_1.NOTFOUNDCODE, constants_1.NOTFOUNDMSG);
            return;
        }
        const projectId = milestone === null || milestone === void 0 ? void 0 : milestone.projectId;
        if (!projectId)
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Invalid project ID in milestone");
        if (progress < 0 || progress > (milestone === null || milestone === void 0 ? void 0 : milestone.totalProgressPoints)) {
            (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, `Progress must be between 0 and ${milestone === null || milestone === void 0 ? void 0 : milestone.totalProgressPoints}`);
        }
        yield db_1.db.milestone.update({
            where: { id: Number(milestoneId) },
            data: {
                progress,
                isMilestoneCompleted: progress === (milestone === null || milestone === void 0 ? void 0 : milestone.totalProgressPoints),
            },
        });
        yield (0, updateProjectProgressUtils_1.updateProjectProgress)(projectId);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.CREATEDCODE, "Milestone progress updated successfully");
    })),
};
