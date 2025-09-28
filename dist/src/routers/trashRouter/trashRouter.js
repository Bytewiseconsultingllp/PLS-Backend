"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trashRouter = void 0;
const express_1 = require("express");
const trashUserController_1 = __importDefault(require("../../controllers/trashController/trashUserController"));
const trashMessages_1 = __importDefault(require("../../controllers/trashController/trashMessages"));
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
const trashNavigationPagesController_1 = __importDefault(require("../../controllers/trashController/trashNavigationPagesController"));
const trashGetQuotes_1 = __importDefault(require("../../controllers/trashController/trashGetQuotes"));
const trashConsultations_1 = __importDefault(require("../../controllers/trashController/trashConsultations"));
const trashHireUsController_1 = __importDefault(require("../../controllers/trashController/trashHireUsController"));
const trashContactUs_1 = __importDefault(require("../../controllers/trashController/trashContactUs"));
exports.trashRouter = (0, express_1.Router)();
exports.trashRouter
    .route("/getTrashedUsers")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, trashUserController_1.default.getTrashedUsers);
exports.trashRouter
    .route("/getTrashedMessages")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, trashMessages_1.default.getAllTrashedMessages);
exports.trashRouter
    .route("/getTrashedNavigationPages")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, trashNavigationPagesController_1.default.trashedNavigationPages);
exports.trashRouter
    .route("/getTrashedQuotes")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, trashGetQuotes_1.default.getTrashedQuotes);
exports.trashRouter
    .route("/getTrashedConsultations")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, trashConsultations_1.default.getAllTrashedConsultations);
exports.trashRouter
    .route("/getTrashedHireUs")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, trashHireUsController_1.default.getAllTrashedHireUs);
exports.trashRouter
    .route("/getTrashedContactUs")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, trashContactUs_1.default.getTrashedContactUs);
