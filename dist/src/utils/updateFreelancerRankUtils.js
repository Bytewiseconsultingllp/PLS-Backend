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
exports.updateFreelancerRank = updateFreelancerRank;
const constants_1 = require("../constants");
const db_1 = require("../database/db");
const rankThresholds = {
    BRONZE: 0,
    SILVER: 200,
    GOLD: 500,
    PLATINUM: 1000,
    DIAMOND: 1500,
    CROWN: 1800,
    ACE: 2000,
    CONQUEROR: 2500,
};
function updateFreelancerRank(uid, kpiPoints) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield db_1.db.user.findUnique({ where: { uid } });
        if (!user) {
            throw { status: constants_1.BADREQUESTCODE, message: "User not found." };
        }
        let newRank = user.kpiRank;
        for (const [rank, threshold] of Object.entries(rankThresholds)) {
            if (kpiPoints >= threshold && rank !== user.kpiRank) {
                newRank = rank;
            }
        }
        if (newRank !== user.kpiRank) {
            yield db_1.db.user.update({
                where: { uid },
                data: { kpiRank: newRank },
            });
        }
        return newRank;
    });
}
