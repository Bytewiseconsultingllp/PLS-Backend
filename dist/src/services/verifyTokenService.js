"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config/config");
function verifyToken(token, secret = config_1.JWT_SECRET) {
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, secret);
        return [null, decoded];
    }
    catch (error) {
        if (error instanceof Error)
            return [new Error(error.message || `Invalid Token::${error}`), null];
        else
            return [
                Error(`Internal server error while verifying token :: ${error}`),
                null,
            ];
    }
}
