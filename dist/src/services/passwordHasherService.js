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
exports.verifyPassword = exports.passwordHasher = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const apiResponseUtils_1 = require("../utils/apiResponseUtils");
const passwordHasher = (password, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        return hashedPassword;
    }
    catch (error) {
        if (error instanceof Error)
            return res
                .status(500)
                .json((0, apiResponseUtils_1.jsonResponse)(500, error.message || "internal server error while hashing the password"));
        else
            return res
                .status(500)
                .json((0, apiResponseUtils_1.jsonResponse)(500, error ||
                "internal server error while hashing the password"));
    }
});
exports.passwordHasher = passwordHasher;
const verifyPassword = (password, existingPassword, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isPasswordValid = yield bcrypt_1.default.compare(password, existingPassword);
        if (!isPasswordValid)
            throw { status: 403, message: "Invalid Credentials" };
        return isPasswordValid;
    }
    catch (error) {
        if (error instanceof Error)
            return res
                .status(500)
                .json((0, apiResponseUtils_1.jsonResponse)(500, error.message || "Internal server Error while checking credentials"));
        return false;
    }
});
exports.verifyPassword = verifyPassword;
