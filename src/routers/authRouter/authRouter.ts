import { Router } from "express";

import authController from "../../controllers/authController/authController";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import {
  forgotPasswordRequestFromUserSchema,
  getSingleUserSChema,
  sendOTPSchema,
  updateForgotPasswordSchema,
  userLoginSchema,
  userRegistrationSchema,
  userUpdateEmailSchema,
  userUpdatePasswordSchema,
  userUpdateSchema,
  verifyForgotPasswordRequestSchema,
  verifyUserSchema,
} from "../../validation/zod";
import rateLimiterMiddleware from "../../middlewares/rateLimiterMiddleware";
import userController from "../../controllers/authController/userController";
import authMiddleware from "../../middlewares/authMiddleware";
export const authRouter = Router();

// Routes**
authRouter
  .route("/register")
  .post(
    validateDataMiddleware(userRegistrationSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many registration attempts. Please try again in 15 minutes.",
        3,
        900,
        "auth_register",
      ),
    authController.registerUser,
  );

authRouter
  .route("/verifyEmail")
  .post(
    validateDataMiddleware(verifyUserSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many verification attempts. Please try again in 10 minutes.",
        5,
        600,
        "auth_verify",
      ),
    authController.verifyUser,
  );

authRouter
  .route("/sendOTP")
  .post(
    validateDataMiddleware(sendOTPSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many OTP requests. Please try again in 10 minutes.",
        3,
        600,
        "auth_otp",
      ),
    authController.sendOTP,
  );

authRouter
  .route("/login")
  .post(
    validateDataMiddleware(userLoginSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many login attempts. Please try again in 5 minutes.",
        5,
        300,
        "auth_login",
      ),
    authController.loginUser,
  );

authRouter
  .route("/logoutUser")
  .get(authMiddleware.checkToken, authController.logOut);
authRouter
  .route("/logoutUserForceFully")
  .post(authMiddleware.checkToken, authController.logOutUserForecfully);

authRouter
  .route("/updateInfo")
  .patch(
    authMiddleware.checkToken,
    validateDataMiddleware(userUpdateSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many update requests. Please try again later.",
        10,
        600,
        "update_info",
      ),
    userController.updateInfo,
  );
authRouter
  .route("/updateEmail")
  .patch(
    authMiddleware.checkToken,
    validateDataMiddleware(userUpdateEmailSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many email update attempts. Please try again in 30 minutes.",
        3,
        1800,
        "update_email",
      ),
    userController.updateEmail,
  );

authRouter
  .route("/updatePassword")
  .patch(
    authMiddleware.checkToken,
    validateDataMiddleware(userUpdatePasswordSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many password update attempts. Please try again in 30 minutes.",
        5,
        1800,
        "update_password",
      ),
    userController.updatePassword,
  );
authRouter.route("/updateRole").patch(
  authMiddleware.checkToken,
  // authMiddleware.checkIfUserIsAdmin,
  (req, res, next) =>
    rateLimiterMiddleware.handle(
      req,
      res,
      next,
      1,
      "Too many role update attempts. Please try again later.",
      5,
      600,
      "update_role",
    ),
  userController.updateRole,
);
authRouter
  .route("/getSingleUser")
  .get(
    authMiddleware.checkToken,
    validateDataMiddleware(getSingleUserSChema),
    userController.getSingleUser,
  );

authRouter
  .route("/getAllUsers")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    userController.getAllUsers,
  );

authRouter
  .route("/searchUsers")
  .get(authMiddleware.checkToken, userController.searchUser);
authRouter
  .route("/getCurrentUser")
  .get(authMiddleware.checkToken, userController.getCurrentUser);

authRouter
  .route("/deleteUser/:uid")
  .delete(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdmin,
    userController.deleteUser,
  );
authRouter
  .route("/trashTheUser")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    userController.moveToTrash,
  );
authRouter
  .route("/unTrashTheUser")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdmin,
    userController.unTrashUser,
  );
// ** forgot password
authRouter
  .route("/forgotPasswordRequestFromUser")
  .post(
    validateDataMiddleware(forgotPasswordRequestFromUserSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many password reset requests. Please try again in 15 minutes.",
        3,
        900,
        "forgot_password",
      ),
    userController.forgotPasswordRequestFromUser,
  );
authRouter
  .route("/verifyForgotPasswordRequest")
  .post(
    validateDataMiddleware(verifyForgotPasswordRequestSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many verification attempts. Please try again in 10 minutes.",
        5,
        600,
        "verify_forgot_pwd",
      ),
    userController.verifyForgotPasswordRequest,
  );
authRouter
  .route("/updateNewPasswordRequest")
  .patch(
    validateDataMiddleware(updateForgotPasswordSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many password update attempts. Please try again in 15 minutes.",
        3,
        900,
        "update_new_pwd",
      ),
    userController.updateNewPasswordRequest,
  );
authRouter
  .route("/refreshAcessToken")
  .post(
    (req, res, next) =>
      rateLimiterMiddleware.handle(
        req,
        res,
        next,
        1,
        "Too many token refresh attempts. Please try again in 5 minutes.",
        20,
        300,
        "refresh_token",
      ),
    authController.refreshAcessToken,
  );
authRouter
  .route("/getAllClients")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    userController.getAllClients,
  );
