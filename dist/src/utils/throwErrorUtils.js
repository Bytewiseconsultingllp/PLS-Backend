"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = throwError;
function throwError(status, message) {
    throw { status, message };
}
