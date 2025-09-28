"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const authController_1 = __importDefault(require("../../controllers/authController/authController"));
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
const userController_1 = __importDefault(require("../../controllers/authController/userController"));
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
exports.authRouter = (0, express_1.Router)();
exports.authRouter.route("/register").post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.userRegistrationSchema), authController_1.default.registerUser);
exports.authRouter
    .route("/verifyEmail")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.verifyUserSchema), authController_1.default.verifyUser);
exports.authRouter
    .route("/sendOTP")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.sendOTPSchema), authController_1.default.sendOTP);
exports.authRouter
    .route("/login")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.userLoginSchema), authController_1.default.loginUser);
exports.authRouter
    .route("/logoutUser")
    .get(authMiddleware_1.default.checkToken, authController_1.default.logOut);
exports.authRouter
    .route("/logoutUserForceFully")
    .post(authMiddleware_1.default.checkToken, authController_1.default.logOutUserForecfully);
exports.authRouter.route("/updateInfo").patch(authMiddleware_1.default.checkToken, (0, validationMiddleware_1.validateDataMiddleware)(zod_1.userUpdateSchema), userController_1.default.updateInfo);
exports.authRouter.route("/updateEmail").patch(authMiddleware_1.default.checkToken, (0, validationMiddleware_1.validateDataMiddleware)(zod_1.userUpdateEmailSchema), userController_1.default.updateEmail);
exports.authRouter.route("/updatePassword").patch(authMiddleware_1.default.checkToken, (0, validationMiddleware_1.validateDataMiddleware)(zod_1.userUpdatePasswordSchema), userController_1.default.updatePassword);
exports.authRouter.route("/updateRole").patch(authMiddleware_1.default.checkToken, userController_1.default.updateRole);
exports.authRouter
    .route("/getSingleUser")
    .get(authMiddleware_1.default.checkToken, (0, validationMiddleware_1.validateDataMiddleware)(zod_1.getSingleUserSChema), userController_1.default.getSingleUser);
exports.authRouter
    .route("/getAllUsers")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, userController_1.default.getAllUsers);
exports.authRouter
    .route("/searchUsers")
    .get(authMiddleware_1.default.checkToken, userController_1.default.searchUser);
exports.authRouter
    .route("/getCurrentUser")
    .get(authMiddleware_1.default.checkToken, userController_1.default.getCurrentUser);
exports.authRouter
    .route("/deleteUser/:uid")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, userController_1.default.deleteUser);
exports.authRouter
    .route("/trashTheUser")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, userController_1.default.moveToTrash);
exports.authRouter
    .route("/unTrashTheUser")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, userController_1.default.unTrashUser);
exports.authRouter
    .route("/forgotPasswordRequestFromUser")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.forgotPasswordRequestFromUserSchema), userController_1.default.forgotPasswordRequestFromUser);
exports.authRouter
    .route("/verifyForgotPasswordRequest")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.verifyForgotPasswordRequestSchema), userController_1.default.verifyForgotPasswordRequest);
exports.authRouter
    .route("/updateNewPasswordRequest")
    .patch((0, validationMiddleware_1.validateDataMiddleware)(zod_1.updateForgotPasswordSchema), userController_1.default.updateNewPasswordRequest);
exports.authRouter.route("/refreshAcessToken").post(authController_1.default.refreshAcessToken);
exports.authRouter
    .route("/getAllClients")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, userController_1.default.getAllClients);
