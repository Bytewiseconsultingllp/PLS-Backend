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
const constants_1 = require("../../constants");
const emailResponses_1 = __importDefault(require("../../constants/emailResponses"));
const db_1 = require("../../database/db");
const globalMailService_1 = require("../../services/globalMailService");
const passwordHasherService_1 = require("../../services/passwordHasherService");
const slugStringGeneratorService_1 = require("../../services/slugStringGeneratorService");
const tokenGeneratorService_1 = __importDefault(require("../../services/tokenGeneratorService"));
const verifyTokenService_1 = require("../../services/verifyTokenService");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const filterAdminUtils_1 = require("../../utils/filterAdminUtils");
const loggerUtils_1 = __importDefault(require("../../utils/loggerUtils"));
let payLoad = {
    uid: "",
    tokenVersion: 0,
    role: "CLIENT",
    isVerified: null,
};
exports.default = {
    registerUser: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userData = req.body;
        const { username, fullName, email, password } = userData;
        const isUserExist = yield db_1.db.user.findFirst({
            where: {
                OR: [
                    { username: username.toLowerCase() },
                    { email: email.toLowerCase() },
                ],
            },
        });
        if (isUserExist)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "user already exists with same username or email.",
            };
        const hashedPassword = (yield (0, passwordHasherService_1.passwordHasher)(password, res));
        const generateOneTimePassword = (0, slugStringGeneratorService_1.generateOtp)();
        console.log(generateOneTimePassword);
        const hashedOTPPassword = (yield (0, passwordHasherService_1.passwordHasher)(generateOneTimePassword.otp, res));
        const createdUser = yield db_1.db.user.create({
            data: {
                username: username.toLowerCase(),
                fullName,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: (0, filterAdminUtils_1.filterAdmin)(email) ? "ADMIN" : "CLIENT",
                otpPassword: (0, filterAdminUtils_1.filterAdmin)(email) ? null : hashedOTPPassword,
                otpPasswordExpiry: (0, filterAdminUtils_1.filterAdmin)(email)
                    ? null
                    : generateOneTimePassword.otpExpiry,
                emailVerifiedAt: (0, filterAdminUtils_1.filterAdmin)(email) ? new Date() : null,
            },
        });
        if (!(0, filterAdminUtils_1.filterAdmin)(email)) {
            yield (0, globalMailService_1.gloabalMailMessage)(email, emailResponses_1.default.OTP_SENDER_MESSAGE(generateOneTimePassword.otp, "30m"), "Account Verification", `Dear ${fullName},`);
        }
        const isSubscribed = yield db_1.db.newsletter.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!(0, filterAdminUtils_1.filterAdmin)(email) && (isSubscribed === null || isSubscribed === void 0 ? void 0 : isSubscribed.email) !== (createdUser === null || createdUser === void 0 ? void 0 : createdUser.email)) {
            yield Promise.all([
                yield (0, globalMailService_1.gloabalMailMessage)(email, emailResponses_1.default.OTP_SENDER_MESSAGE(generateOneTimePassword.otp, "30m"), "Account Verification", `Dear ${fullName},`),
                yield db_1.db.newsletter.create({
                    data: {
                        email: email.toLowerCase(),
                    },
                }),
            ]);
        }
        const { generateAccessToken } = tokenGeneratorService_1.default;
        payLoad = {
            uid: createdUser.email,
            isVerified: null,
            tokenVersion: createdUser.tokenVersion,
            role: createdUser.role,
        };
        const accessToken = generateAccessToken(payLoad, res);
        if (!(0, filterAdminUtils_1.filterAdmin)(email)) {
            res.cookie("accessToken", accessToken, constants_1.ACESSTOKENCOOKIEOPTIONS);
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, (0, filterAdminUtils_1.filterAdmin)(email)
            ? "User registered successfully"
            : "Please verify your email with 6 digit OTP sent to your email", {
            fullName,
            email,
            accessToken: !(0, filterAdminUtils_1.filterAdmin)(email) ? accessToken : null,
        });
    })),
    loginUser: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { username, password } = req.body;
        const user = yield db_1.db.user.findUnique({ where: { username: username } });
        if (!user)
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid credentials" };
        if (user.trashedBy)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "You account has been suspended by Administrators. Please contact support",
            };
        const isPasswordMatch = yield (0, passwordHasherService_1.verifyPassword)(password, user === null || user === void 0 ? void 0 : user.password, res);
        if (!isPasswordMatch)
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid credentials" };
        const { generateAccessToken, generateRefreshToken } = tokenGeneratorService_1.default;
        payLoad = {
            uid: user === null || user === void 0 ? void 0 : user.uid,
            tokenVersion: user === null || user === void 0 ? void 0 : user.tokenVersion,
            role: !(0, filterAdminUtils_1.filterAdmin)(user.email) ? user.role : "ADMIN",
            isVerified: new Date(),
        };
        const accessToken = generateAccessToken(payLoad, res);
        const refreshToken = generateRefreshToken(payLoad, res);
        res
            .cookie("refreshToken", refreshToken, constants_1.REFRESHTOKENCOOKIEOPTIONS)
            .cookie("accessToken", accessToken, constants_1.ACESSTOKENCOOKIEOPTIONS);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User logged in successfully", {
            uid: user.uid,
            username,
            refreshToken,
            accessToken,
        });
    })),
    verifyUser: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { OTP, email } = req.body;
        const user = yield db_1.db.user.findUnique({ where: { email: email } });
        if (!user)
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid email" };
        if (user.otpPasswordExpiry && user.otpPasswordExpiry < new Date()) {
            yield db_1.db.user.update({
                where: { email: email.toLowerCase() },
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
        const isPasswordMatch = yield (0, passwordHasherService_1.verifyPassword)(OTP, user === null || user === void 0 ? void 0 : user.otpPassword, res);
        if (!isPasswordMatch)
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid OTP" };
        yield db_1.db.user.update({
            where: { email: email.toLowerCase() },
            data: {
                emailVerifiedAt: new Date(),
                otpPassword: null,
                otpPasswordExpiry: null,
            },
        });
        const { generateAccessToken, generateRefreshToken } = tokenGeneratorService_1.default;
        payLoad = {
            uid: user === null || user === void 0 ? void 0 : user.uid,
            tokenVersion: user === null || user === void 0 ? void 0 : user.tokenVersion,
            role: user.role === "FREELANCER"
                ? "FREELANCER"
                : (0, filterAdminUtils_1.filterAdmin)(email)
                    ? "ADMIN"
                    : "CLIENT",
            isVerified: new Date(),
        };
        const accessToken = generateAccessToken(payLoad, res);
        const refreshToken = generateRefreshToken(payLoad, res);
        res
            .cookie("refreshToken", refreshToken, constants_1.REFRESHTOKENCOOKIEOPTIONS)
            .cookie("accessToken", accessToken, constants_1.ACESSTOKENCOOKIEOPTIONS);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User verified  successfully", {
            uid: user.uid,
            email: user.email,
            refreshToken,
            accessToken,
        });
    })),
    sendOTP: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        const user = yield db_1.db.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user)
            throw { status: constants_1.BADREQUESTCODE, message: "Invalid email" };
        if (user.emailVerifiedAt)
            throw { status: constants_1.BADREQUESTCODE, message: "Email already verified" };
        const generateOneTimePassword = (0, slugStringGeneratorService_1.generateOtp)();
        const hashedOTPPassword = (yield (0, passwordHasherService_1.passwordHasher)(generateOneTimePassword.otp, res));
        yield db_1.db.user.update({
            where: { email: email.toLowerCase() },
            data: {
                otpPassword: hashedOTPPassword,
                otpPasswordExpiry: generateOneTimePassword.otpExpiry,
            },
        });
        yield (0, globalMailService_1.gloabalMailMessage)(email, emailResponses_1.default.OTP_SENDER_MESSAGE(generateOneTimePassword.otp, "30m"), "Account Verification", `Dear ${user.fullName},`);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "OTP sent successfully", { email });
    })),
    logOut: (req, res) => {
        res.cookie("refreshToken", "", constants_1.REFRESHTOKENCOOKIEOPTIONS);
        res.cookie("accessToken", "", constants_1.ACESSTOKENCOOKIEOPTIONS);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User logged out successfully");
    },
    logOutUserForecfully: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { uid } = req.body;
        if (!uid)
            throw { status: constants_1.BADREQUESTCODE, message: "Please Send user ID" };
        yield db_1.db.user.update({
            where: { uid },
            data: {
                tokenVersion: { increment: 1 },
            },
        });
        res.cookie("refreshToken", "", constants_1.REFRESHTOKENCOOKIEOPTIONS);
        res.cookie("accessToken", "", constants_1.ACESSTOKENCOOKIEOPTIONS);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User logged out successfully");
    })),
    refreshAcessToken: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const refreshToken = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!refreshToken)
            throw { status: constants_1.BADREQUESTCODE, message: "Please provide refresh token" };
        const [error, decoded] = (0, verifyTokenService_1.verifyToken)(refreshToken);
        if (error) {
            loggerUtils_1.default.error("Error while verifying token", "authController.ts:152");
            throw { status: constants_1.UNAUTHORIZEDCODE, message: constants_1.UNAUTHORIZEDMSG };
        }
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.uid)) {
            loggerUtils_1.default.warn("Invalid token. Not uid found in accessToken", "authController.ts:158");
            throw { status: constants_1.UNAUTHORIZEDCODE, message: constants_1.UNAUTHORIZEDMSG };
        }
        const user = yield db_1.db.user.findUnique({ where: { uid: decoded.uid } });
        if (!user) {
            loggerUtils_1.default.warn("Invalid token. User not found", "authController.ts:164");
            throw { status: constants_1.UNAUTHORIZEDCODE, message: constants_1.UNAUTHORIZEDMSG };
        }
        if (user.tokenVersion !== decoded.tokenVersion) {
            loggerUtils_1.default.error("Invalid token. tokenVersion doesn't match maybe session is expired", "authController.ts:169");
            throw {
                status: constants_1.UNAUTHORIZEDCODE,
                message: "Session expired. Please login again",
            };
        }
        const { generateAccessToken } = tokenGeneratorService_1.default;
        const payLoad = {
            uid: user && (user === null || user === void 0 ? void 0 : user.uid),
            tokenVersion: user === null || user === void 0 ? void 0 : user.tokenVersion,
            role: (0, filterAdminUtils_1.filterAdmin)(user === null || user === void 0 ? void 0 : user.email) ? "ADMIN" : "CLIENT",
            isVerified: user === null || user === void 0 ? void 0 : user.emailVerifiedAt,
        };
        const accessToken = generateAccessToken(payLoad, res);
        res.cookie("accessToken", accessToken, constants_1.ACESSTOKENCOOKIEOPTIONS);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Token refreshed successfully", {
            accessToken,
        });
    })),
};
