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
exports.deleteFromCloudinary = exports.uploadOnCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const node_fs_1 = __importDefault(require("node:fs"));
const config_1 = require("../config/config");
const constants_1 = require("../constants");
cloudinary_1.v2.config({
    cloud_name: config_1.CLOUDINARY_NAME,
    api_key: config_1.CLOUDINARY_API_KEY,
    api_secret: config_1.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = (localFilePath, fileName, format) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!localFilePath)
            return null;
        const response = yield cloudinary_1.v2.uploader.upload(localFilePath, {
            resource_type: "raw",
            filename_override: fileName,
            folder: "hireUsDocs",
            format: format,
        });
        return response;
    }
    catch (error) {
        node_fs_1.default.unlinkSync(localFilePath);
        if (error instanceof Error)
            throw { status: 500, message: error.message };
        else
            throw {
                status: constants_1.INTERNALSERVERERRORCODE,
                message: `Error while uploading files:: ${error}`,
            };
    }
});
exports.uploadOnCloudinary = uploadOnCloudinary;
const deleteFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!publicId)
            throw { status: constants_1.NOTFOUNDCODE, message: "File not found on file storage" };
        return (yield cloudinary_1.v2.uploader.destroy(publicId, {
            resource_type: "raw",
        }));
    }
    catch (error) {
        if (error instanceof Error)
            throw { status: 500, message: error.message };
        else
            throw {
                status: constants_1.INTERNALSERVERERRORCODE,
                message: `Error while deleting files:: ${error}`,
            };
    }
});
exports.deleteFromCloudinary = deleteFromCloudinary;
