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
exports.distributeMilestonePoints = exports.updateProjectProgress = void 0;
const constants_1 = require("../constants");
const db_1 = require("../database/db");
const throwErrorUtils_1 = __importDefault(require("./throwErrorUtils"));
const updateProjectProgress = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!projectId)
        (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Invalid project ID");
    const milestones = yield db_1.db.milestone.findMany({
        where: { projectId },
    });
    if (!milestones || milestones.length === 0)
        return;
    const totalProgressPoints = milestones.reduce((sum, milestone) => sum + (milestone.totalProgressPoints || 0), 0);
    const totalProgress = milestones.reduce((sum, milestone) => sum + (milestone.progress || 0), 0);
    const progressPercentage = totalProgressPoints > 0
        ? Math.ceil((totalProgress / totalProgressPoints) * 100)
        : 0;
    yield db_1.db.project.update({
        where: { id: projectId },
        data: { progressPercentage },
    });
});
exports.updateProjectProgress = updateProjectProgress;
const distributeMilestonePoints = (milestones) => {
    if (!milestones || milestones.length === 0)
        return milestones;
    const totalPriorities = milestones.reduce((sum, milestone) => sum + (milestone.priorityRank || 1), 0);
    if (totalPriorities <= 0)
        (0, throwErrorUtils_1.default)(constants_1.BADREQUESTCODE, "Invalid priority ranks");
    return milestones.map((milestone) => {
        const priorityWeight = (milestone.priorityRank || 1) / totalPriorities;
        const points = Math.round(100 * priorityWeight);
        return Object.assign(Object.assign({}, milestone), { totalProgressPoints: points > 0 ? points : 1 });
    });
};
exports.distributeMilestonePoints = distributeMilestonePoints;
