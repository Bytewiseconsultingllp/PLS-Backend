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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterMiddleware = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const db_1 = require("../database/db");
const apiResponseUtils_1 = require("../utils/apiResponseUtils");
const config_1 = require("../config/config");
const constants_1 = require("../constants");
const getMinutesUtils_1 = __importDefault(require("../utils/getMinutesUtils"));
class RateLimiterMiddleware {
    constructor() {
        this.rateLimiter = null;
        this.currentTotalPoints = null;
        this.currentDuration = null;
    }
    handle(req_1, res_1, next_1) {
        return __awaiter(this, arguments, void 0, function* (req, res, next, consumptionPoints = 1, message, totalPoints, duration = 60) {
            try {
                if (config_1.ENV === "DEVELOPMENT")
                    return next();
                if (!this.rateLimiter ||
                    this.currentTotalPoints !== totalPoints ||
                    this.currentDuration !== duration) {
                    this.rateLimiter = new rate_limiter_flexible_1.RateLimiterPrisma({
                        storeClient: db_1.db,
                        points: totalPoints || 10,
                        duration,
                    });
                    this.currentTotalPoints = totalPoints || 10;
                    this.currentDuration = duration;
                }
                yield this.rateLimiter.consume(req.ip, consumptionPoints);
                next();
            }
            catch (err) {
                const error = err;
                if ((error === null || error === void 0 ? void 0 : error.remainingPoints) === 0) {
                    const remainingSeconds = Math.ceil(error.msBeforeNext / 1000);
                    const remainingDuration = (0, getMinutesUtils_1.default)(remainingSeconds);
                    (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.TOOMANYREQUESTSCODE, message || `${constants_1.TOOMANYREQUESTSMSG} ${remainingDuration}`, null).end();
                }
                else {
                    (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.INTERNALSERVERERRORCODE, `${constants_1.ERRMSG} in rateLimiter middleware: ${err}`, null);
                }
            }
        });
    }
}
exports.RateLimiterMiddleware = RateLimiterMiddleware;
const rateLimiterMiddleware = new RateLimiterMiddleware();
exports.default = rateLimiterMiddleware;
