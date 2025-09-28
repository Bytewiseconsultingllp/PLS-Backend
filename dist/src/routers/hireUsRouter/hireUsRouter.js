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
exports.hireUsRouter = void 0;
const express_1 = require("express");
const hireUsController_1 = __importDefault(require("../../controllers/hireUsController/hireUsController"));
const multerMiddleware_1 = require("../../middlewares/multerMiddleware");
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
exports.hireUsRouter = (0, express_1.Router)();
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
const rateLimiterMiddleware_1 = __importDefault(require("../../middlewares/rateLimiterMiddleware"));
exports.hireUsRouter.route("/createHireUsRequest").post(multerMiddleware_1.fileUploader, (0, validationMiddleware_1.validateDataMiddleware)(zod_1.hireUsSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield rateLimiterMiddleware_1.default.handle(req, res, next, 10, undefined, 10, 28800);
}), hireUsController_1.default.createHireUsRequest);
exports.hireUsRouter
    .route("/getAllHireUsRequests")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, hireUsController_1.default.getAllHireUsRequests);
exports.hireUsRouter
    .route("/getSingleHireUsRequest/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, hireUsController_1.default.getSingleHireUsRequest);
exports.hireUsRouter
    .route("/trashHireUsRequest/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, hireUsController_1.default.trashHireUsRequest);
exports.hireUsRouter
    .route("/untrashHireUsRequest/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, hireUsController_1.default.untrashHireUsRequest);
exports.hireUsRouter
    .route("/permanentDeleteHireUsRequest/:id")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, hireUsController_1.default.permanentDeleteHireUsRequest);
