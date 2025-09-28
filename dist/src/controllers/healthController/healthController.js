"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const quickerUtils_1 = __importDefault(require("../../utils/quickerUtils"));
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const constants_1 = require("../../constants");
exports.default = {
    health: (req, res) => {
        try {
            const healthData = {
                applicationHealth: quickerUtils_1.default.getApplicationHealth(),
                systemHealth: quickerUtils_1.default.getSystemHealth(),
            };
            (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, healthData);
        }
        catch (error) {
            if (error instanceof Error) {
                throw {
                    status: 500,
                    message: error.message || constants_1.INTERNALSERVERERRORMSG,
                };
            }
        }
    },
};
