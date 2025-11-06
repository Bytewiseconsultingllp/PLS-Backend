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
import {
  ENV,
  ENABLE_RATE_LIMIT_IN_DEV,
  RATE_LIMIT_WHITELIST_IPS,
} from "../../config/config";
export const authRouter = Router();

// 🔍 DIAGNOSTIC ENDPOINT - Remove after debugging
authRouter.get("/rate-limiter-diagnostic", (req, res) => {
  const clientIP = req.ip || req.socket.remoteAddress || "unknown";
  res.json({
    success: true,
    diagnostic: {
      environment: ENV,
      enableRateLimitInDev: ENABLE_RATE_LIMIT_IN_DEV,
      detectedIP: clientIP,
      whitelistedIPs: RATE_LIMIT_WHITELIST_IPS,
      trustProxy: req.app.get("trust proxy"),
      headers: {
        xForwardedFor: req.headers["x-forwarded-for"],
        xRealIp: req.headers["x-real-ip"],
      },
    },
  });
});

// Routes**
authRouter
  .route("/register")
  .post(
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
    validateDataMiddleware(userRegistrationSchema),
    authController.registerUser,
  );

authRouter
  .route("/verifyEmail")
  .post(
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
    validateDataMiddleware(verifyUserSchema),
    authController.verifyUser,
  );

authRouter
  .route("/sendOTP")
  .post(
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
    validateDataMiddleware(sendOTPSchema),
    authController.sendOTP,
  );

authRouter
  .route("/login")
  .post(
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
    validateDataMiddleware(userLoginSchema),
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
    validateDataMiddleware(userUpdateSchema),
    userController.updateInfo,
  );
authRouter
  .route("/updateEmail")
  .patch(
    authMiddleware.checkToken,
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
    validateDataMiddleware(userUpdateEmailSchema),
    userController.updateEmail,
  );

authRouter
  .route("/updatePassword")
  .patch(
    authMiddleware.checkToken,
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
    validateDataMiddleware(userUpdatePasswordSchema),
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
    validateDataMiddleware(forgotPasswordRequestFromUserSchema),
    userController.forgotPasswordRequestFromUser,
  );
authRouter
  .route("/verifyForgotPasswordRequest")
  .post(
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
    validateDataMiddleware(verifyForgotPasswordRequestSchema),
    userController.verifyForgotPasswordRequest,
  );
authRouter
  .route("/updateNewPasswordRequest")
  .patch(
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
    validateDataMiddleware(updateForgotPasswordSchema),
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
