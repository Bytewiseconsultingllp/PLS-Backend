"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpResponse = exports.jsonResponse = void 0;
const config_1 = require("../config/config");
const jsonResponse = (status, message = "OK", data = null, metaData = null, optMessage = "") => {
    return {
        success: status < 400,
        statusCode: status,
        message: message,
        data: data,
        metaData: metaData,
        optMessage: optMessage,
    };
};
exports.jsonResponse = jsonResponse;
const httpResponse = (req, res, statusCode, message, data = null) => {
    const response = {
        success: statusCode < 400,
        status: statusCode,
        message,
        data,
        requestInfo: {
            url: req.originalUrl,
            ip: req.ip || null,
            method: req.method,
        },
    };
    if (config_1.ENV && config_1.ENV === "PRODUCTION") {
        delete response.requestInfo.ip;
    }
    return res.status(statusCode).json(response).end();
};
exports.httpResponse = httpResponse;
