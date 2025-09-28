"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../database/db");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
exports.default = {
    getTrashedUsers: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const trashedUsers = yield db_1.db.user.findMany({
            where: {
                trashedBy: { not: null },
                trashedAt: { not: null },
            },
            select: {
                uid: true,
                fullName: true,
                username: true,
                email: true,
                role: true,
                trashedBy: true,
                trashedAt: true,
                createdAt: true,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, 200, "Data fetched successfully", trashedUsers);
    })),
};
