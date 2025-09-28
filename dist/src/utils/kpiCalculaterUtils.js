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
exports.calculateKpiPoints = calculateKpiPoints;
const constants_1 = require("../constants");
const db_1 = require("../database/db");
function calculateKpiPoints(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const { difficulty, rating, uid } = input;
        if (rating < 1 || rating > 5) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Rating must be between 1 and 5.",
            };
        }
        const user = yield db_1.db.user.findUnique({ where: { uid } });
        if (!user) {
            throw { status: constants_1.BADREQUESTCODE, message: "User not found." };
        }
        const currentPoints = user.kpiRankPoints || 0;
        const basePoints = {
            EASY: 20,
            MEDIUM: 40,
            HARD: 60,
        };
        const earnedPoints = Math.round((rating / 5) * basePoints[difficulty]);
        const totalPoints = currentPoints + earnedPoints;
        yield db_1.db.user.update({
            where: { uid },
            data: { kpiRankPoints: totalPoints },
        });
        return totalPoints;
    });
}
