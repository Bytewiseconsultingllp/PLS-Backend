"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitorsRouter = void 0;
const express_1 = require("express");
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
const visitorsController_1 = __importDefault(require("../../controllers/visitorsController/visitorsController"));
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
exports.visitorsRouter = (0, express_1.Router)();
exports.visitorsRouter
    .route("/")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.visitorsSchema), visitorsController_1.default.createVisitor);
exports.visitorsRouter
    .route("/test")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.visitorsSchema), visitorsController_1.default.createVisitor);
exports.visitorsRouter
    .route("/")
    .get(authMiddleware_1.default.checkToken, visitorsController_1.default.getAllVisitors);
exports.visitorsRouter
    .route("/:id")
    .get(authMiddleware_1.default.checkToken, visitorsController_1.default.getSingleVisitor);
exports.visitorsRouter
    .route("/:id")
    .put((0, validationMiddleware_1.validateDataMiddleware)(zod_1.visitorsSchema), authMiddleware_1.default.checkToken, visitorsController_1.default.updateVisitor);
exports.visitorsRouter
    .route("/:id")
    .delete(authMiddleware_1.default.checkToken, visitorsController_1.default.deleteVisitor);
