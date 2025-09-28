"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const healthController_1 = __importDefault(require("../../controllers/healthController/healthController"));
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.route("/").get(healthController_1.default.health);
