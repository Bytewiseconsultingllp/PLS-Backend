"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_os_1 = __importDefault(require("node:os"));
const config_1 = require("../config/config");
exports.default = {
    getSystemHealth: () => {
        return {
            cpuUsage: node_os_1.default.loadavg(),
            totalMemory: `${(node_os_1.default.totalmem() / 1024 / 1024).toFixed(2)} MB`,
            freeMemory: `${(node_os_1.default.freemem() / 1024 / 1024).toFixed(2)} MB`,
            timeStamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
        };
    },
    getApplicationHealth: () => {
        return {
            environment: config_1.ENV,
            uptime: `${process.uptime().toFixed(2)} Second`,
            memoryUsage: {
                heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            },
            cpuUsage: {
                user: process.cpuUsage().user,
                system: process.cpuUsage().system,
            },
            timeStamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
        };
    },
};
