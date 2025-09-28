"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const library_1 = require("@prisma/client/runtime/library");
const config_1 = require("../config/config");
const notFoundHandler = (req, __, next) => {
    const error = new Error(`This Route(${req.originalUrl}) doesn't exist on server`);
    error.status = 404;
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (error, req, res, next) => {
    const errObject = Object.assign({ success: false, statusCode: error.status || 500, message: error instanceof library_1.PrismaClientKnownRequestError
            ? "something went wrong while working with prisma!!"
            : error.message + "!!" || "internal server error!!", data: null, requestInfo: Object.assign({ url: req.originalUrl, method: req.method }, (config_1.ENV !== "PRODUCTION" && { ip: req === null || req === void 0 ? void 0 : req.ip })) }, (config_1.ENV !== "PRODUCTION" && {
        stack: error.stack ? error.stack : "No stack has been sent",
    }));
    res
        .status(error.status || 500)
        .json(errObject)
        .end();
    next();
};
exports.errorHandler = errorHandler;
