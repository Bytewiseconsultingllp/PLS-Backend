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
exports.getFreelancerUsernamesWhoAreInterested = exports.findUniqueProject = exports.findUniqueUser = void 0;
const constants_1 = require("../constants");
const db_1 = require("../database/db");
const loggerUtils_1 = __importDefault(require("./loggerUtils"));
const findUniqueUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id)
        throw { status: constants_1.BADREQUESTCODE, message: "Id is required!" };
    let user = null;
    try {
        user = (yield db_1.db.user.findUniqueOrThrow({
            where: {
                uid: id,
            },
            select: {
                uid: true,
                username: true,
                email: true,
                fullName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        }));
        if (!user) {
            loggerUtils_1.default.error("User not found in findUniqueUserUtils.ts");
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        }
        else
            return user;
    }
    catch (error) {
        if (error instanceof Error)
            throw {
                status: constants_1.NOTFOUNDCODE,
                message: error.message || constants_1.INTERNALSERVERERRORMSG,
            };
        else
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.INTERNALSERVERERRORMSG };
    }
});
exports.findUniqueUser = findUniqueUser;
const findUniqueProject = (uniqueIdentifier) => __awaiter(void 0, void 0, void 0, function* () {
    if (!uniqueIdentifier)
        throw { status: constants_1.BADREQUESTCODE, message: "Id is required!" };
    let project = null;
    try {
        project = yield db_1.db.project.findUniqueOrThrow({
            where: { projectSlug: uniqueIdentifier },
        });
        if (!project) {
            loggerUtils_1.default.error("project not found in findUniqueUtils.ts");
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        }
        else
            return project;
    }
    catch (error) {
        if (error instanceof Error)
            throw {
                status: constants_1.NOTFOUNDCODE,
                message: error.message || constants_1.INTERNALSERVERERRORMSG,
            };
        else
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.INTERNALSERVERERRORMSG };
    }
});
exports.findUniqueProject = findUniqueProject;
const getFreelancerUsernamesWhoAreInterested = (freelancerIds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield Promise.all(freelancerIds.map((freelancerId) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield db_1.db.user.findUniqueOrThrow({
                where: {
                    uid: freelancerId,
                    trashedBy: null,
                    trashedAt: null,
                    role: "FREELANCER",
                },
                select: { username: true },
            });
            return user.username;
        })));
    }
    catch (errr) {
        if (errr instanceof Error)
            throw {
                status: constants_1.NOTFOUNDCODE,
                message: errr.message + " with freelancer role" || constants_1.INTERNALSERVERERRORMSG,
            };
        else
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.INTERNALSERVERERRORMSG };
    }
});
exports.getFreelancerUsernamesWhoAreInterested = getFreelancerUsernamesWhoAreInterested;
