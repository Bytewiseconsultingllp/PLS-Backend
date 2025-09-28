"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigationPagesRouter = void 0;
const express_1 = require("express");
const navigationPagesController_1 = __importDefault(require("../../controllers/navigationPagesController/navigationPagesController"));
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
exports.navigationPagesRouter = (0, express_1.Router)();
exports.navigationPagesRouter.route("/createNavigationPage").post(navigationPagesController_1.default.createNavigationPage);
exports.navigationPagesRouter
    .route("/getSingleNavigationPage/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, navigationPagesController_1.default.getSingleNavigationPage);
exports.navigationPagesRouter.route("/getAllNavigationPages").get(navigationPagesController_1.default.getAllNavigationPages);
exports.navigationPagesRouter
    .route("/updateNavigationPage/:id")
    .put(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, navigationPagesController_1.default.updateNavigationPage);
exports.navigationPagesRouter.route("/deleteNavigationPage/:id").delete(navigationPagesController_1.default.deleteNavigationPage);
exports.navigationPagesRouter
    .route("/trashNavigationPage/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, navigationPagesController_1.default.trashNavigationPage);
exports.navigationPagesRouter
    .route("/untrashNavigationPage/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, navigationPagesController_1.default.untrashNavigationPage);
exports.navigationPagesRouter.route("/menuItems/:id/addChildrenToMenuItem").patch(navigationPagesController_1.default.addChildrenToMenuItem);
