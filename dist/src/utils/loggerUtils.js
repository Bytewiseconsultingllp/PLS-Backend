"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorizeLevel = void 0;
const moment_1 = __importDefault(require("moment"));
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const config_1 = require("../config/config");
const colorette_1 = require("colorette");
const colorizeLevel = (level) => {
    if (level.includes("ERROR"))
        return (0, colorette_1.red)(level);
    else if (level.includes("INFO"))
        return (0, colorette_1.green)(level);
    else if (level.includes("WARN"))
        return (0, colorette_1.yellow)(level);
    else
        return (0, colorette_1.magenta)(level);
};
exports.colorizeLevel = colorizeLevel;
const devFileTransport = new winston_1.default.transports.DailyRotateFile({
    filename: "logs/development-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
});
const prodFileTransport = new winston_1.default.transports.DailyRotateFile({
    filename: "logs/production-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
});
const consoleTransport = new winston_1.default.transports.Console({
    format: winston_1.default.format.combine(winston_1.default.format.prettyPrint(), winston_1.default.format.printf((_a) => {
        var { timestamp, level, message } = _a, meta = __rest(_a, ["timestamp", "level", "message"]);
        const customLevel = (0, exports.colorizeLevel)(level.includes("error")
            ? "ERROR"
            : level.includes("info")
                ? "INFO"
                : level.includes("warn")
                    ? "WARN"
                    : "DEBUG");
        const customTimeStamp = (0, moment_1.default)(timestamp).format("DD/MM/YYYY  HH:mm:ss A");
        const customLog = `
-------------------------------------------------------------------------------
  ${customLevel}::${message} 
  ${(0, colorette_1.yellow)("TIMESTAMP")}::${(0, colorette_1.green)(customTimeStamp)}
  ${(0, colorette_1.magenta)("META")}::${(0, colorette_1.yellow)(JSON.stringify(meta, null, 2))}
-------------------------------------------------------------------------------`;
        return customLog;
    })),
});
const logLevel = config_1.ENV === "PRODUCTION" ? "warn" : "info";
const logger = winston_1.default.createLogger({
    level: logLevel,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }), winston_1.default.format.printf((_a) => {
        var { timestamp, level, message } = _a, meta = __rest(_a, ["timestamp", "level", "message"]);
        return `[${level}]: ${message} \n[time]: ${(0, moment_1.default)(timestamp).format("YYYY-MM-DD HH:mm:ss")} \nmeta: ${JSON.stringify(meta)}`;
    })),
    transports: [
        consoleTransport,
        ...(config_1.ENV === "PRODUCTION" ? [prodFileTransport] : [devFileTransport]),
    ],
});
exports.default = logger;
