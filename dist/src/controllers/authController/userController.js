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
const constants_1 = require("../../constants");
const db_1 = require("../../database/db");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const passwordHasherService_1 = require("../../services/passwordHasherService");
const slugStringGeneratorService_1 = require("../../services/slugStringGeneratorService");
const sendOTPService_1 = require("../../services/sendOTPService");
const loggerUtils_1 = __importDefault(require("../../utils/loggerUtils"));
exports.default = {
    updateInfo: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userData = req.body;
        const { uid, username, fullName } = userData;
        const isUserAlreadyExist = yield db_1.db.user.findFirst({
            where: {
                username: username.toLowerCase(),
                uid: { not: uid },
            },
        });
        if (isUserAlreadyExist)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "user already exists with same username",
            };
        const updatedUser = yield db_1.db.user.update({
            where: { uid },
            data: {
                username,
                fullName,
            },
            select: { username: true, fullName: true },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User updated successfully", updatedUser);
    })),
    updateEmail: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userData = req.body;
        const { uid, email } = userData;
        const isUserAlreadyExist = yield db_1.db.user.findFirst({
            where: {
                email: email.toLowerCase(),
                uid: { not: uid },
            },
        });
        if (isUserAlreadyExist)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "user already exists with same email",
            };
        const updatedUser = yield db_1.db.user.update({
            where: { uid },
            data: {
                email,
                emailVerifiedAt: null,
                tokenVersion: { increment: 1 },
            },
            select: { email: true, updatedAt: true, tokenVersion: true },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User updated successfully", updatedUser);
    })),
    updatePassword: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userData = req.body;
        const { uid, oldPassword, newPassword: password } = userData;
        const user = yield db_1.db.user.findUnique({ where: { uid } });
        if (!user)
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid credentials" };
        const isPasswordMatch = yield (0, passwordHasherService_1.verifyPassword)(oldPassword, user === null || user === void 0 ? void 0 : user.password, res);
        if (!isPasswordMatch)
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid credentials" };
        const hashedPassword = (yield (0, passwordHasherService_1.passwordHasher)(password, res));
        yield db_1.db.user.update({
            where: { uid },
            data: {
                password: hashedPassword,
                tokenVersion: { increment: 1 },
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User password updated successfully");
    })),
    updateRole: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userData = req.body;
        const { role, uid } = userData;
        if (!role || !uid) {
            throw { status: constants_1.BADREQUESTCODE, message: "Role and UID is required" };
        }
        const updatedUser = yield db_1.db.user.update({
            where: { uid },
            data: {
                role: role,
                tokenVersion: { increment: 1 },
            },
            select: { role: true },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User role updated successfully", updatedUser);
    })),
    getSingleUser: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.body;
        const user = yield db_1.db.user.findUnique({
            where: { username },
            select: {
                username: true,
                email: true,
                fullName: true,
                emailVerifiedAt: true,
                uid: true,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User fetched successfully", user);
    })),
    getAllUsers: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const pageLimit = Number(limit);
        if (isNaN(pageNumber) ||
            isNaN(pageLimit) ||
            pageNumber <= 0 ||
            pageLimit <= 0) {
            throw { status: 400, message: "Invalid pagination parameters!!" };
        }
        const skip = (pageNumber - 1) * pageLimit;
        const take = pageLimit;
        const users = yield db_1.db.user.findMany({
            where: {
                trashedAt: null,
                trashedBy: null,
            },
            select: {
                uid: true,
                username: true,
                fullName: true,
                email: true,
                role: true,
                emailVerifiedAt: true,
                createdAt: true,
                updatedAt: true,
            },
            skip,
            take,
            orderBy: {
                createdAt: "asc",
            },
        });
        const totalUsers = yield db_1.db.user.count({
            where: { trashedAt: null, trashedBy: null },
        });
        const totalPages = Math.ceil(totalUsers / pageLimit);
        const hasNextPage = totalPages > pageNumber;
        const hasPreviousPage = pageNumber > 1;
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Users fetched successfully", {
            users,
            pagination: {
                totalPages,
                totalUsers,
                currentPage: pageNumber,
                hasPreviousPage,
                hasNextPage,
            },
        });
    })),
    searchUser: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { q, page = 1, limit = 10 } = req.query;
        if (!q)
            throw { status: 400, message: "Search query is required!!" };
        const searchQuery = q;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        if (isNaN(pageNumber) ||
            isNaN(limitNumber) ||
            pageNumber <= 0 ||
            limitNumber <= 0) {
            throw { status: 400, message: "Invalid pagination parameters!!" };
        }
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;
        const users = yield db_1.db.$queryRaw `
  SELECT "uid", "username", "fullName", "email", "emailVerifiedAt", "role"
  FROM "User"
  WHERE to_tsvector('english', "username" || ' ' || "email" || ' ' || "fullName") @@ plainto_tsquery('english', ${searchQuery})
    AND ("trashedBy" IS NULL OR "trashedAt" IS NULL) -- only non-trashed users
  ORDER BY "createdAt" DESC
  OFFSET ${skip} LIMIT ${take}
`;
        const totalUsersCount = yield db_1.db.$queryRaw `
  SELECT COUNT(*) FROM "User"
  WHERE to_tsvector('english', "username" || ' ' || "email" || ' ' || "fullName") @@ plainto_tsquery('english', ${searchQuery})
    AND ("trashedBy" IS NULL OR "trashedAt" IS NULL) -- count only non-trashed users
`;
        const UsersCount = Number((_a = totalUsersCount[0]) === null || _a === void 0 ? void 0 : _a.count);
        const totalPages = Math.ceil(UsersCount / take);
        const hasNextPage = totalPages > pageNumber;
        const hasPreviousPage = pageNumber > 1;
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Data searched successfully", {
            users,
            pagination: {
                hasNextPage,
                hasPreviousPage,
                totalPages,
                currentPage: pageNumber,
            },
        });
    })),
    getCurrentUser: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const uid = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        if (!uid)
            throw { status: constants_1.UNAUTHORIZEDCODE, message: constants_1.UNAUTHORIZEDMSG };
        const user = yield db_1.db.user.findUnique({
            where: { uid },
            select: {
                username: true,
                email: true,
                fullName: true,
                emailVerifiedAt: true,
                uid: true,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User fetched successfully", user);
    })),
    moveToTrash: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { victimUid } = req.body;
        const trashedBy = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        if (!trashedBy)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Please Send the id of user who want to trash it",
            };
        const user = yield db_1.db.user.findUnique({ where: { uid: trashedBy } });
        if (!user)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "You aren't allowed to trash data",
            };
        if (!victimUid)
            throw { status: constants_1.BADREQUESTCODE, message: "Please Send the id of victim" };
        const victim = yield db_1.db.user.findUnique({ where: { uid: victimUid } });
        if (!victim)
            throw { status: constants_1.BADREQUESTCODE, message: "User not found" };
        if (victim.role === "ADMIN")
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Admin can't be moved in trash ",
            };
        yield db_1.db.user.update({
            where: { uid: victimUid },
            data: {
                trashedBy: `@${user === null || user === void 0 ? void 0 : user.username} - ${user === null || user === void 0 ? void 0 : user.fullName} - ${user === null || user === void 0 ? void 0 : user.role}`,
                trashedAt: new Date(),
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Data moved to trash successfully.");
    })),
    unTrashUser: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { victimUid } = req.body;
        if (!victimUid)
            throw { status: constants_1.BADREQUESTCODE, message: "Please Send the id of victim" };
        const victim = yield db_1.db.user.findUnique({ where: { uid: victimUid } });
        if (!victim)
            throw { status: constants_1.BADREQUESTCODE, message: "User not found" };
        yield db_1.db.user.update({
            where: { uid: victimUid },
            data: {
                trashedBy: null,
                trashedAt: null,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Data untrashed successfully.");
    })),
    deleteUser: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { uid } = req.params;
        if (!uid)
            throw { status: constants_1.BADREQUESTCODE, message: "Please Send the id of victim" };
        yield db_1.db.user.delete({ where: { uid } });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User deleted successfully");
    })),
    forgotPasswordRequestFromUser: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        const user = yield db_1.db.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if ((user === null || user === void 0 ? void 0 : user.password) === "") {
            (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Password already reset please create new one", { uid: user.uid });
            return;
        }
        if (!user)
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid email" };
        if (!user.emailVerifiedAt)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Please verify your email first",
            };
        const generateOneTimePassword = (0, slugStringGeneratorService_1.generateOtp)();
        yield db_1.db.user.update({
            where: { email: email.toLowerCase() },
            data: {
                otpPassword: generateOneTimePassword.otp,
                otpPasswordExpiry: generateOneTimePassword.otpExpiry,
            },
        });
        yield (0, sendOTPService_1.sendOTP)(email, generateOneTimePassword.otp, user.fullName, "Please use this OTP to reset your password", "Reset Password");
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "OTP sent successfully", { email });
    })),
    verifyForgotPasswordRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { OTP } = req.body;
        const user = yield db_1.db.user.findUnique({ where: { otpPassword: OTP } });
        if ((user === null || user === void 0 ? void 0 : user.password) === "") {
            (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "OTP verified successfully", {
                uid: user.uid,
            });
            return;
        }
        if (!user) {
            loggerUtils_1.default.error("User not found");
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid OTP" };
        }
        if (user.otpPasswordExpiry && user.otpPasswordExpiry < new Date()) {
            yield db_1.db.user.update({
                where: { otpPassword: OTP },
                data: {
                    otpPassword: null,
                    otpPasswordExpiry: null,
                },
            });
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "OTP expired. Please try again",
            };
        }
        const updatedUser = yield db_1.db.user.update({
            where: { otpPassword: OTP },
            data: {
                otpPassword: null,
                otpPasswordExpiry: null,
                password: "",
            },
        });
        res.cookie("rndID", updatedUser.uid, constants_1.REFRESHTOKENCOOKIEOPTIONS);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "OTP verified successfully", {
            uid: updatedUser.uid,
        });
    })),
    updateNewPasswordRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { newPassword } = req.body;
        const { uid } = req.body;
        if (!uid)
            throw { status: constants_1.BADREQUESTCODE, message: "Please send uid" };
        const user = yield db_1.db.user.findUnique({ where: { uid: uid } });
        if ((user === null || user === void 0 ? void 0 : user.password) !== "")
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "You are not allowed to change your password",
            };
        if (!newPassword)
            throw { status: constants_1.BADREQUESTCODE, message: "Please send password" };
        const hashedPassword = (yield (0, passwordHasherService_1.passwordHasher)(newPassword, res));
        yield db_1.db.user.update({
            where: { uid: uid },
            data: {
                password: hashedPassword,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Password updated successfully");
    })),
    getAllClients: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const pageLimit = Number(limit);
        if (isNaN(pageNumber) ||
            isNaN(pageLimit) ||
            pageNumber <= 0 ||
            pageLimit <= 0) {
            throw { status: 400, message: "Invalid pagination parameters!!" };
        }
        const skip = (pageNumber - 1) * pageLimit;
        const take = pageLimit;
        const users = yield db_1.db.user.findMany({
            where: {
                role: "CLIENT",
                trashedAt: null,
                trashedBy: null,
            },
            select: {
                uid: true,
                username: true,
                fullName: true,
                email: true,
                role: true,
                emailVerifiedAt: true,
                createdAt: true,
                updatedAt: true,
                projects: true,
            },
            skip,
            take,
            orderBy: {
                createdAt: "asc",
            },
        });
        const totalUsers = yield db_1.db.user.count({
            where: { role: "CLIENT", trashedAt: null, trashedBy: null },
        });
        const totalPages = Math.ceil(totalUsers / pageLimit);
        const hasNextPage = totalPages > pageNumber;
        const hasPreviousPage = pageNumber > 1;
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Clients fetched successfully", {
            users,
            pagination: {
                totalPages,
                totalUsers,
                currentPage: pageNumber,
                hasPreviousPage,
                hasNextPage,
            },
        });
    })),
};
