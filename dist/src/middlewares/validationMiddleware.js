"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDataMiddleware = validateDataMiddleware;
const zod_1 = require("zod");
const constants_1 = require("../constants");
function validateDataMiddleware(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map((issue) => ({
                    message: `${issue.message}`,
                }));
                res.status(constants_1.BADREQUESTCODE).json({
                    success: false,
                    status: constants_1.BADREQUESTCODE,
                    error: "Invalid data",
                    details: errorMessages,
                });
            }
            else {
                res.status(constants_1.INTERNALSERVERERRORCODE).json({
                    success: false,
                    status: constants_1.INTERNALSERVERERRORCODE,
                    error: constants_1.INTERNALSERVERERRORMSG,
                });
            }
        }
    };
}
