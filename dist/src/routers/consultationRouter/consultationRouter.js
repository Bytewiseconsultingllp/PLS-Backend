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
exports.consultationRouter = void 0;
const express_1 = require("express");
const consultationController_1 = __importDefault(require("../../controllers/consultationController/consultationController"));
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
const rateLimiterMiddleware_1 = __importDefault(require("../../middlewares/rateLimiterMiddleware"));
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
exports.consultationRouter = (0, express_1.Router)();
exports.consultationRouter.route("/requestAConsultation").post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.consultationBookingSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield rateLimiterMiddleware_1.default.handle(req, res, next, 10, undefined, 10, 28800);
}), consultationController_1.default.createConsultation);
exports.consultationRouter.route("/updateRequestedConsultation/:id").post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.consultationBookingSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield rateLimiterMiddleware_1.default.handle(req, res, next, 10, undefined, 10, 28800);
}), consultationController_1.default.updateConsultation);
exports.consultationRouter
    .route("/getAllRequestedConsultations")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, consultationController_1.default.getAllRequestedConsultations);
exports.consultationRouter
    .route("/getSingleRequestedConsultation/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, consultationController_1.default.getSingleRequestedConsultation);
exports.consultationRouter
    .route("/deleteRequestedConsultation/:id")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, consultationController_1.default.deleteRequestedConsultation);
exports.consultationRouter
    .route("/acceptRequestedConsultation/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, consultationController_1.default.acceptConsultationBooking);
exports.consultationRouter
    .route("/rejectRequestedConsultation/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, consultationController_1.default.rejectConsultationBooking);
exports.consultationRouter
    .route("/trashRequestedConsultation/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, consultationController_1.default.trashConsultation);
exports.consultationRouter
    .route("/untrashRequestedConsultation/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, consultationController_1.default.untrashConsultation);
