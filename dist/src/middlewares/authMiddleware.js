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
const asyncHandlerUtils_1 = require("../utils/asyncHandlerUtils");
const verifyTokenService_1 = require("../services/verifyTokenService");
const constants_1 = require("../constants");
const db_1 = require("../database/db");
const loggerUtils_1 = __importDefault(require("../utils/loggerUtils"));
exports.default = {
    checkToken: (0, asyncHandlerUtils_1.asyncHandler)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
        const accessToken = req.header("Authorization");
        if (!accessToken) {
            loggerUtils_1.default.error("No access token found", "authMiddleware.ts:13");
            throw { status: constants_1.UNAUTHORIZEDCODE, message: constants_1.UNAUTHORIZEDMSG };
        }
        const parsedToken = (accessToken === null || accessToken === void 0 ? void 0 : accessToken.split(" ")[1]) || "";
        if (!parsedToken) {
            loggerUtils_1.default.error(`Invalid access token. It seems Bearer is not attached with the Token or maybe check the spelling of Bearer`, parsedToken, "authMiddleware.ts:18");
            throw { status: constants_1.UNAUTHORIZEDCODE, message: constants_1.UNAUTHORIZEDMSG };
        }
        const [error, decoded] = (0, verifyTokenService_1.verifyToken)(parsedToken);
        if (error) {
            loggerUtils_1.default.error(`Error while verifying token :: ${String(parsedToken)}`, "authMiddleware.ts:24");
            throw { status: constants_1.UNAUTHORIZEDCODE, message: constants_1.UNAUTHORIZEDMSG };
        }
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.uid)) {
            loggerUtils_1.default.warn("Invalid token. Not uid found in accessToken", "authMiddleware.ts:28");
            throw { status: constants_1.UNAUTHORIZEDCODE, message: constants_1.UNAUTHORIZEDMSG };
        }
        const user = yield db_1.db.user.findUnique({ where: { uid: decoded.uid } });
        if ((user === null || user === void 0 ? void 0 : user.tokenVersion) !== decoded.tokenVersion) {
            loggerUtils_1.default.error("Invalid token. tokenVersion doesn't match maybe session is expired", "authMiddleware.ts:33");
            throw {
                status: constants_1.UNAUTHORIZEDCODE,
                message: "Session expired. Please login again",
            };
        }
        if (decoded.isVerified == null) {
            loggerUtils_1.default.error("user is not verified", "authMiddleware.ts:36");
            throw { status: constants_1.FORBIDDENCODE, message: constants_1.FORBIDDENMSG };
        }
        req.userFromToken = decoded;
        return next();
    })),
    checkIfUserIsAdmin: (req, _, next) => {
        var _a;
        if (((_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.role) !== "ADMIN") {
            loggerUtils_1.default.info("Since User is not Admin He/She can't perform this operation", "authMiddleware.ts:48");
            throw { status: constants_1.FORBIDDENCODE, message: constants_1.FORBIDDENMSG };
        }
        return next();
    },
    checkIfUserIAdminOrModerator: (req, _, next) => {
        var _a, _b;
        if (((_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.role) !== "ADMIN" &&
            ((_b = req.userFromToken) === null || _b === void 0 ? void 0 : _b.role) !== "MODERATOR") {
            loggerUtils_1.default.info("Checking if user is admin or moderator", "authMiddleware.ts:53");
            throw { status: constants_1.FORBIDDENCODE, message: constants_1.FORBIDDENMSG };
        }
        return next();
    },
    checkIfUserIsAdminModeratorOrFreeLancer: (req, _, next) => {
        var _a, _b, _c;
        if (((_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.role) !== "FREELANCER" &&
            ((_b = req.userFromToken) === null || _b === void 0 ? void 0 : _b.role) !== "ADMIN" &&
            ((_c = req.userFromToken) === null || _c === void 0 ? void 0 : _c.role) !== "MODERATOR") {
            loggerUtils_1.default.info("Checking if user is freelancer or admin", "authMiddleware.ts:68");
            throw { status: constants_1.FORBIDDENCODE, message: constants_1.FORBIDDENMSG };
        }
        return next();
    },
};
