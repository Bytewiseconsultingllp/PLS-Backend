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
const cloudinaryService_1 = require("../../services/cloudinaryService");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const constants_1 = require("../../constants");
const db_1 = require("../../database/db");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const loggerUtils_1 = __importDefault(require("../../utils/loggerUtils"));
const globalMailService_1 = require("../../services/globalMailService");
exports.default = {
    createHireUsRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const files = req.files;
        const data = req.body;
        if (!files || files.length === 0) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "At least one file is required.",
            };
        }
        const uploadFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const localPath = file.path;
            const fileType = (_b = (_a = localPath
                .split("/")
                .at(-1)) === null || _a === void 0 ? void 0 : _a.split(".")[1]) === null || _b === void 0 ? void 0 : _b.split("-")[0];
            return yield (0, cloudinaryService_1.uploadOnCloudinary)(localPath, file.filename, fileType);
        });
        const uploadResponses = yield Promise.all(files.map(uploadFile));
        const responseAfterUploadingFilesOnCloudinary = uploadResponses.map((response) => ({
            name: response === null || response === void 0 ? void 0 : response.original_filename,
            url: response === null || response === void 0 ? void 0 : response.secure_url,
        }));
        const createdHireUs = yield db_1.db.hireUs.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                detail: data.detail,
                address: data.address,
                company: data.company,
                docs: responseAfterUploadingFilesOnCloudinary,
            },
        });
        yield (0, globalMailService_1.gloabalMailMessage)(data.email, constants_1.HIREUSMESSAGE, "Prime Logic Solution", "Request to hire Prime Logic Solution", `Dear ${data.name}`);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, { data: createdHireUs });
    })),
    getAllHireUsRequests: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const hireUs = yield db_1.db.hireUs.findMany({
            where: { trashedAt: null, trashedBy: null },
        });
        if (hireUs.length === 0)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, { data: hireUs });
    })),
    getSingleHireUsRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const hireUs = yield db_1.db.hireUs.findUnique({ where: { id: Number(id) } });
        if (!hireUs)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, { data: hireUs });
    })),
    trashHireUsRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        const user = yield db_1.db.user.findUnique({
            where: { uid: ((_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid) || "" },
        });
        const hireUs = yield db_1.db.hireUs.update({
            where: { id: Number(id) },
            data: {
                trashedAt: new Date(),
                trashedBy: `@${user === null || user === void 0 ? void 0 : user.username}-${user === null || user === void 0 ? void 0 : user.fullName}-${user === null || user === void 0 ? void 0 : user.role}`,
            },
        });
        if (!hireUs)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, { data: hireUs });
    })),
    untrashHireUsRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const hireUs = yield db_1.db.hireUs.update({
            where: { id: Number(id) },
            data: { trashedAt: null, trashedBy: null },
        });
        if (!hireUs)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, { data: hireUs });
    })),
    permanentDeleteHireUsRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const hireUs = yield db_1.db.hireUs.findUnique({ where: { id: Number(id) } });
        if (!hireUs)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        const deleteCloudinaryFiles = () => __awaiter(void 0, void 0, void 0, function* () {
            if (hireUs.docs) {
                const documents = hireUs.docs;
                yield Promise.all(documents.map((doc) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a;
                    if (!doc.url)
                        throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
                    const publicId = (_a = doc.url) === null || _a === void 0 ? void 0 : _a.split("hireUsDocs/")[1];
                    if (publicId) {
                        loggerUtils_1.default.info(publicId);
                        yield (0, cloudinaryService_1.deleteFromCloudinary)(`hireUsDocs/${publicId}`);
                        loggerUtils_1.default.warn(`hireUsDocs/${publicId}`);
                    }
                })));
            }
        });
        const responseFromCloudinary = yield deleteCloudinaryFiles()
            .then(() => true)
            .catch(() => {
            throw { status: 500, message: "Unable to delete files" };
        });
        yield db_1.db.hireUs.delete({ where: { id: Number(id) } });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            data: { responseFromCloudinary },
        });
    })),
};
