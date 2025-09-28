"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomStrings = generateRandomStrings;
exports.generateSlug = generateSlug;
exports.generateOtp = generateOtp;
exports.defineExpireyTime = defineExpireyTime;
exports.generateUsername = generateUsername;
exports.lowerCase = lowerCase;
const node_crypto_1 = __importDefault(require("node:crypto"));
function generateRandomStrings(length) {
    var _a;
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    const randomBytes = node_crypto_1.default.randomBytes(length);
    let randomString = "";
    for (let i = 0; i < length; i++) {
        const randomByte = (_a = randomBytes[i]) !== null && _a !== void 0 ? _a : 0;
        const randomIndex = randomByte % charactersLength;
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
}
function generateSlug(slugString) {
    let slug = slugString.toLowerCase();
    slug = slug.replace(/[^a-z0-9\s-]/g, "");
    slug = slug.trim().replace(/\s+/g, "-");
    return slug;
}
function generateOtp(length = 6, expiryValue = 30, expiryUnit = "m") {
    let otp = Array.from({ length }, () => node_crypto_1.default.randomInt(0, 10)).join("");
    otp = otp.padStart(length, "0");
    let expiryMilliseconds = expiryValue * 60 * 1000;
    if (expiryUnit === "h")
        expiryMilliseconds = expiryValue * 60 * 60 * 1000;
    if (expiryUnit === "s")
        expiryMilliseconds = expiryValue * 1000;
    if (expiryUnit === "d")
        expiryMilliseconds = expiryValue * 24 * 60 * 60 * 1000;
    const otpExpiry = new Date(Date.now() + expiryMilliseconds);
    return { otp, otpExpiry };
}
function defineExpireyTime(expiryValue = 30, expiryUnit = "m") {
    let expiryMilliseconds = expiryValue * 60 * 1000;
    if (expiryUnit === "h")
        expiryMilliseconds = expiryValue * 60 * 60 * 1000;
    if (expiryUnit === "s")
        expiryMilliseconds = expiryValue * 1000;
    if (expiryUnit === "d")
        expiryMilliseconds = expiryValue * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + expiryMilliseconds);
}
function generateUsername(fullName) {
    if (!fullName) {
        throw new Error("Full name is required to generate a username.");
    }
    return fullName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_");
}
function lowerCase(text) {
    return text.toLowerCase();
}
