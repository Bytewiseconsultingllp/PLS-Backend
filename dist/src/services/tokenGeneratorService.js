"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
exports.default = {
    generateAccessToken: (payload, res) => {
        try {
            const token = jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, { expiresIn: "14m" });
            return token;
        }
        catch (error) {
            if (error instanceof Error)
                return res.status(500).json({
                    success: false,
                    message: error.message ||
                        "Internal server Error while generating access token",
                    status: 500,
                });
            else
                return res.status(500).json({
                    success: false,
                    message: error ||
                        "Internal server Error while generating access token",
                    status: 500,
                });
        }
    },
    generateRefreshToken: (payload, res) => {
        try {
            const token = jsonwebtoken_1.default.sign({ uid: payload.uid, tokenVersion: payload.tokenVersion }, config_1.JWT_SECRET, { expiresIn: "7d" });
            return token;
        }
        catch (error) {
            if (error instanceof Error)
                return res.status(500).json({
                    success: false,
                    message: error.message ||
                        "Internal server Error while generating access token",
                    status: 500,
                });
            else
                return res.status(500).json({
                    success: false,
                    message: error ||
                        "Internal server Error while generating access token",
                    status: 500,
                });
        }
    },
};
